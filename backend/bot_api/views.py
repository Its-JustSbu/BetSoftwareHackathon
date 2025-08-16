from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from django.shortcuts import get_object_or_404
from django.db.models import Q

from users.models import User
from wallet.models import Wallet, Transaction, PiggyBank, PiggyBankContribution
from .serializers import (
    UserInfoSerializer, WalletInfoSerializer, TransactionInfoSerializer,
    PiggyBankInfoSerializer, UserSearchSerializer, WalletSearchSerializer
)


class BotAPIPermission(HasAPIKey):
    """
    Custom permission class for bot API access
    Requires a valid API key to access endpoints
    """
    pass


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def api_status(request):
    """
    Check API status and validate API key
    """
    return Response({
        'status': 'active',
        'message': 'Bot API is working properly',
        'authenticated': True
    })


@api_view(['POST'])
@permission_classes([BotAPIPermission])
def search_user(request):
    """
    Search for a user by various criteria
    POST /bot-api/users/search/
    Body: {
        "username": "optional_username",
        "email": "optional_email@example.com",
        "phone_number": "optional_phone",
        "user_id": "optional_uuid"
    }
    """
    serializer = UserSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    queryset = User.objects.all()
    
    # Build query filters
    filters = Q()
    if data.get('username'):
        filters &= Q(username__iexact=data['username'])
    if data.get('email'):
        filters &= Q(email__iexact=data['email'])
    if data.get('phone_number'):
        filters &= Q(phone_number=data['phone_number'])
    if data.get('user_id'):
        filters &= Q(id=data['user_id'])
    
    users = queryset.filter(filters)
    
    if not users.exists():
        return Response({
            'message': 'No users found matching the criteria',
            'users': []
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserInfoSerializer(users, many=True)
    return Response({
        'message': f'Found {len(serializer.data)} user(s)',
        'users': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_user_by_id(request, user_id):
    """
    Get user information by user ID
    GET /bot-api/users/{user_id}/
    """
    user = get_object_or_404(User, id=user_id)
    serializer = UserInfoSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_user_wallets(request, user_id):
    """
    Get all wallets for a specific user
    GET /bot-api/users/{user_id}/wallets/
    """
    user = get_object_or_404(User, id=user_id)
    wallets = Wallet.objects.filter(owner=user)
    serializer = WalletInfoSerializer(wallets, many=True)
    return Response({
        'user': user.username,
        'wallet_count': len(serializer.data),
        'wallets': serializer.data
    })


@api_view(['POST'])
@permission_classes([BotAPIPermission])
def search_wallets(request):
    """
    Search for wallets by various criteria
    POST /bot-api/wallets/search/
    Body: {
        "owner_username": "optional_username",
        "owner_email": "optional_email",
        "wallet_id": "optional_uuid",
        "is_active": true/false
    }
    """
    serializer = WalletSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    queryset = Wallet.objects.select_related('owner')
    
    # Build query filters
    filters = Q()
    if data.get('owner_username'):
        filters &= Q(owner__username__iexact=data['owner_username'])
    if data.get('owner_email'):
        filters &= Q(owner__email__iexact=data['owner_email'])
    if data.get('wallet_id'):
        filters &= Q(id=data['wallet_id'])
    if data.get('is_active') is not None:
        filters &= Q(is_active=data['is_active'])
    
    wallets = queryset.filter(filters)
    
    if not wallets.exists():
        return Response({
            'message': 'No wallets found matching the criteria',
            'wallets': []
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = WalletInfoSerializer(wallets, many=True)
    return Response({
        'message': f'Found {len(serializer.data)} wallet(s)',
        'wallets': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_wallet_by_id(request, wallet_id):
    """
    Get wallet information by wallet ID
    GET /bot-api/wallets/{wallet_id}/
    """
    wallet = get_object_or_404(Wallet, id=wallet_id)
    serializer = WalletInfoSerializer(wallet)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_wallet_transactions(request, wallet_id):
    """
    Get all transactions for a specific wallet
    GET /bot-api/wallets/{wallet_id}/transactions/
    """
    wallet = get_object_or_404(Wallet, id=wallet_id)
    transactions = Transaction.objects.filter(wallet=wallet).order_by('-created_at')
    
    # Optional pagination parameters
    limit = request.GET.get('limit', 50)
    try:
        limit = int(limit)
        limit = min(limit, 100)  # Max 100 transactions per request
    except (ValueError, TypeError):
        limit = 50
    
    transactions = transactions[:limit]
    serializer = TransactionInfoSerializer(transactions, many=True)
    
    return Response({
        'wallet_id': wallet_id,
        'wallet_owner': wallet.owner.username,
        'transaction_count': len(serializer.data),
        'transactions': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_user_transactions(request, user_id):
    """
    Get all transactions for a specific user across all their wallets
    GET /bot-api/users/{user_id}/transactions/
    """
    user = get_object_or_404(User, id=user_id)
    user_wallets = Wallet.objects.filter(owner=user)
    transactions = Transaction.objects.filter(
        wallet__in=user_wallets
    ).order_by('-created_at')
    
    # Optional pagination parameters
    limit = request.GET.get('limit', 50)
    try:
        limit = int(limit)
        limit = min(limit, 100)  # Max 100 transactions per request
    except (ValueError, TypeError):
        limit = 50
    
    transactions = transactions[:limit]
    serializer = TransactionInfoSerializer(transactions, many=True)
    
    return Response({
        'user_id': user_id,
        'username': user.username,
        'wallet_count': user_wallets.count(),
        'transaction_count': len(serializer.data),
        'transactions': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_user_piggybanks(request, user_id):
    """
    Get all piggy banks for a specific user (created by them)
    GET /bot-api/users/{user_id}/piggybanks/
    """
    user = get_object_or_404(User, id=user_id)
    piggybanks = PiggyBank.objects.filter(creator=user)
    serializer = PiggyBankInfoSerializer(piggybanks, many=True)
    
    return Response({
        'user_id': user_id,
        'username': user.username,
        'piggybank_count': len(serializer.data),
        'piggybanks': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_piggybank_by_id(request, piggybank_id):
    """
    Get piggy bank information by piggy bank ID
    GET /bot-api/piggybanks/{piggybank_id}/
    """
    piggybank = get_object_or_404(PiggyBank, id=piggybank_id)
    serializer = PiggyBankInfoSerializer(piggybank)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_all_users_summary(request):
    """
    Get a summary of all users in the system
    GET /bot-api/users/summary/
    """
    users = User.objects.all().order_by('-created_at')
    
    # Optional pagination parameters
    limit = request.GET.get('limit', 20)
    try:
        limit = int(limit)
        limit = min(limit, 100)  # Max 100 users per request
    except (ValueError, TypeError):
        limit = 20
    
    users = users[:limit]
    serializer = UserInfoSerializer(users, many=True)
    
    total_users = User.objects.count()
    
    return Response({
        'total_users_in_system': total_users,
        'returned_count': len(serializer.data),
        'users': serializer.data
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_system_stats(request):
    """
    Get system-wide statistics
    GET /bot-api/stats/
    """
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'total_wallets': Wallet.objects.count(),
        'active_wallets': Wallet.objects.filter(is_active=True).count(),
        'total_transactions': Transaction.objects.count(),
        'completed_transactions': Transaction.objects.filter(status='COMPLETED').count(),
        'total_piggybanks': PiggyBank.objects.count(),
        'active_piggybanks': PiggyBank.objects.filter(is_active=True).count(),
    }
    
    return Response({
        'message': 'System statistics retrieved successfully',
        'stats': stats
    })
