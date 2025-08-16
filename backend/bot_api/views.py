from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from users.models import User
from wallet.models import Wallet, Transaction, PiggyBank, PiggyBankContribution
from kyc.models import KYCProfile, KYCDocument
from .serializers import (
    UserInfoSerializer, WalletInfoSerializer, TransactionInfoSerializer,
    PiggyBankInfoSerializer, UserSearchSerializer, WalletSearchSerializer,
    KYCProfileSerializer, KYCDocumentSerializer, TransactionValidationSerializer
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
    Search for wallets by various criteria including KYC filters
    POST /bot-api/wallets/search/
    Body: {
        "owner_username": "optional_username",
        "owner_email": "optional_email",
        "wallet_id": "optional_uuid",
        "is_active": true/false,
        "kyc_verified_only": true/false,
        "min_kyc_level": "BASIC|ENHANCED|PREMIUM"
    }
    """
    serializer = WalletSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    queryset = Wallet.objects.select_related('owner', 'owner__kyc_profile')
    
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
    
    # KYC-related filters
    if data.get('kyc_verified_only', False):
        filters &= Q(owner__kyc_profile__kyc_status='APPROVED')
    
    if data.get('min_kyc_level'):
        level_hierarchy = {'BASIC': 1, 'ENHANCED': 2, 'PREMIUM': 3}
        min_level = level_hierarchy.get(data['min_kyc_level'], 1)
        
        level_filter = Q()
        if min_level <= 1:
            level_filter |= Q(owner__kyc_profile__verification_level='BASIC')
        if min_level <= 2:
            level_filter |= Q(owner__kyc_profile__verification_level='ENHANCED')
        if min_level <= 3:
            level_filter |= Q(owner__kyc_profile__verification_level='PREMIUM')
        
        filters &= level_filter & Q(owner__kyc_profile__kyc_status='APPROVED')
    
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
    # Basic stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    
    # KYC stats
    users_with_kyc = User.objects.filter(kyc_profile__isnull=False).count()
    verified_users = User.objects.filter(kyc_profile__kyc_status='APPROVED').count()
    pending_kyc = User.objects.filter(kyc_profile__kyc_status='PENDING').count()
    under_review_kyc = User.objects.filter(kyc_profile__kyc_status='UNDER_REVIEW').count()
    
    # KYC levels
    basic_kyc = User.objects.filter(
        kyc_profile__kyc_status='APPROVED',
        kyc_profile__verification_level='BASIC'
    ).count()
    enhanced_kyc = User.objects.filter(
        kyc_profile__kyc_status='APPROVED',
        kyc_profile__verification_level='ENHANCED'
    ).count()
    premium_kyc = User.objects.filter(
        kyc_profile__kyc_status='APPROVED',
        kyc_profile__verification_level='PREMIUM'
    ).count()
    
    stats = {
        'users': {
            'total_users': total_users,
            'active_users': active_users,
            'users_with_kyc_profile': users_with_kyc,
            'kyc_verified_users': verified_users,
            'kyc_pending': pending_kyc,
            'kyc_under_review': under_review_kyc,
        },
        'kyc_levels': {
            'basic': basic_kyc,
            'enhanced': enhanced_kyc,
            'premium': premium_kyc,
        },
        'wallets': {
            'total_wallets': Wallet.objects.count(),
            'active_wallets': Wallet.objects.filter(is_active=True).count(),
        },
        'transactions': {
            'total_transactions': Transaction.objects.count(),
            'completed_transactions': Transaction.objects.filter(status='COMPLETED').count(),
        },
        'piggybanks': {
            'total_piggybanks': PiggyBank.objects.count(),
            'active_piggybanks': PiggyBank.objects.filter(is_active=True).count(),
        },
    }
    
    return Response({
        'message': 'System statistics retrieved successfully',
        'stats': stats
    })


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_user_kyc_status(request, user_id):
    """
    Get KYC status for a specific user
    GET /bot-api/users/{user_id}/kyc-status/
    """
    user = get_object_or_404(User, id=user_id)
    
    kyc_data = {
        'user_id': user_id,
        'username': user.username,
        'has_kyc_profile': user.has_kyc_profile,
        'is_kyc_verified': user.is_kyc_verified,
        'kyc_status': user.kyc_status,
        'kyc_verification_level': user.kyc_verification_level,
        'transaction_limit': user.get_transaction_limit(),
        'kyc_summary': user.get_kyc_summary(),
    }
    
    # Add KYC profile details if exists
    if user.has_kyc_profile:
        kyc_profile = user.kyc_profile
        kyc_data['kyc_profile'] = {
            'id': kyc_profile.id,
            'full_name': kyc_profile.full_name,
            'created_at': kyc_profile.created_at,
            'reviewed_at': kyc_profile.reviewed_at,
            'reviewed_by': kyc_profile.reviewed_by.username if kyc_profile.reviewed_by else None,
            'rejection_reason': kyc_profile.rejection_reason,
        }
        
        # Add document count
        documents = KYCDocument.objects.filter(kyc_profile=kyc_profile)
        kyc_data['documents'] = {
            'total': documents.count(),
            'approved': documents.filter(status='APPROVED').count(),
            'pending': documents.filter(status='PENDING').count(),
            'rejected': documents.filter(status='REJECTED').count(),
        }
    
    return Response(kyc_data)


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_kyc_profiles(request):
    """
    Get all KYC profiles with filtering options
    GET /bot-api/kyc/profiles/
    Query params: status, level, limit
    """
    queryset = KYCProfile.objects.select_related('user', 'reviewed_by')
    
    # Filtering
    status_filter = request.GET.get('status')
    if status_filter:
        queryset = queryset.filter(kyc_status__iexact=status_filter)
    
    level_filter = request.GET.get('level') 
    if level_filter:
        queryset = queryset.filter(verification_level__iexact=level_filter)
    
    # Pagination
    limit = request.GET.get('limit', 50)
    try:
        limit = int(limit)
        limit = min(limit, 100)  # Max 100 profiles per request
    except (ValueError, TypeError):
        limit = 50
    
    profiles = queryset.order_by('-created_at')[:limit]
    serializer = KYCProfileSerializer(profiles, many=True)
    
    return Response({
        'message': f'Found {len(serializer.data)} KYC profile(s)',
        'profiles': serializer.data
    })


@api_view(['POST'])
@permission_classes([BotAPIPermission])
def validate_transaction(request):
    """
    Validate if a user can perform a transaction based on KYC status
    POST /bot-api/validate-transaction/
    Body: {
        "user_id": "uuid",
        "amount": "1000.00",
        "transaction_type": "TRANSFER_OUT"
    }
    """
    serializer = TransactionValidationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_id = serializer.validated_data['user_id']
    amount = serializer.validated_data['amount']
    transaction_type = serializer.validated_data['transaction_type']
    
    user = get_object_or_404(User, id=user_id)
    
    # Validate transaction
    can_transact, reason = user.can_perform_transaction(amount)
    needs_upgrade, upgrade_reason = user.requires_kyc_upgrade(amount)
    
    response_data = {
        'user_id': user_id,
        'username': user.username,
        'amount': str(amount),
        'transaction_type': transaction_type,
        'validation': {
            'can_transact': can_transact,
            'reason': reason,
            'needs_kyc_upgrade': needs_upgrade,
            'upgrade_reason': upgrade_reason,
        },
        'user_kyc_info': {
            'has_kyc_profile': user.has_kyc_profile,
            'is_kyc_verified': user.is_kyc_verified,
            'kyc_status': user.kyc_status,
            'verification_level': user.kyc_verification_level,
            'transaction_limit': user.get_transaction_limit(),
        }
    }
    
    return Response(response_data)


@api_view(['GET'])
@permission_classes([BotAPIPermission])
def get_users_by_kyc_level(request, kyc_level):
    """
    Get users by KYC verification level
    GET /bot-api/users/kyc-level/{level}/
    Levels: basic, enhanced, premium, unverified
    """
    kyc_level = kyc_level.upper()
    
    if kyc_level == 'UNVERIFIED':
        # Users without KYC or not verified
        users = User.objects.filter(
            Q(kyc_profile__isnull=True) | ~Q(kyc_profile__kyc_status='APPROVED')
        )
    elif kyc_level in ['BASIC', 'ENHANCED', 'PREMIUM']:
        users = User.objects.filter(
            kyc_profile__kyc_status='APPROVED',
            kyc_profile__verification_level=kyc_level
        )
    else:
        return Response({
            'error': 'Invalid KYC level. Use: basic, enhanced, premium, or unverified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Pagination
    limit = request.GET.get('limit', 20)
    try:
        limit = int(limit)
        limit = min(limit, 100)
    except (ValueError, TypeError):
        limit = 20
    
    users = users[:limit]
    serializer = UserInfoSerializer(users, many=True)
    
    return Response({
        'kyc_level': kyc_level,
        'user_count': len(serializer.data),
        'users': serializer.data
    })
