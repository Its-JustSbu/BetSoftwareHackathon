from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from decimal import Decimal

from .models import Wallet, Transaction, PiggyBank, PiggyBankContribution, PiggyBankMember
from .serializers import (
    WalletSerializer, WalletCreateSerializer, TransactionSerializer,
    DepositSerializer, TransferSerializer, PiggyBankSerializer,
    PiggyBankContributionSerializer, PiggyBankContributeSerializer,
    PiggyBankMemberSerializer, AddMemberSerializer, PiggyBankPaymentSerializer
)
from users.models import User


class WalletListCreateView(generics.ListCreateAPIView):
    """
    List user's wallets or create a new wallet
    """
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WalletCreateSerializer
        return WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user, is_active=True)


class WalletDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a wallet
    """
    serializer_class = WalletSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user, is_active=True)

    def perform_destroy(self, instance):
        # Soft delete - just mark as inactive
        instance.is_active = False
        instance.save()


@extend_schema(
    request=DepositSerializer,
    responses={200: TransactionSerializer},
    description="Deposit money into a wallet"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def deposit_money(request, wallet_id):
    """
    Deposit money into a wallet
    """
    wallet = get_object_or_404(Wallet, id=wallet_id, owner=request.user, is_active=True)
    serializer = DepositSerializer(data=request.data)

    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Wallet deposit')

        with transaction.atomic():
            # Create transaction record
            txn = Transaction.objects.create(
                wallet=wallet,
                transaction_type='DEPOSIT',
                amount=amount,
                status='COMPLETED',
                description=description
            )

            # Update wallet balance
            wallet.balance += amount
            wallet.save()

        txn_serializer = TransactionSerializer(txn)
        return Response(txn_serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=TransferSerializer,
    responses={200: TransactionSerializer},
    description="Transfer money to another wallet"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def transfer_money(request, wallet_id):
    """
    Transfer money from one wallet to another
    """
    sender_wallet = get_object_or_404(Wallet, id=wallet_id, owner=request.user, is_active=True)
    serializer = TransferSerializer(data=request.data)

    if serializer.is_valid():
        recipient_wallet_id = serializer.validated_data['recipient_wallet_id']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Peer-to-peer transfer')

        recipient_wallet = get_object_or_404(Wallet, id=recipient_wallet_id, is_active=True)

        # Check if sender has sufficient balance
        if not sender_wallet.can_debit(amount):
            return Response(
                {"error": "Insufficient balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create outgoing transaction for sender
            sender_txn = Transaction.objects.create(
                wallet=sender_wallet,
                transaction_type='TRANSFER_OUT',
                amount=amount,
                status='COMPLETED',
                description=f"Transfer to {recipient_wallet.owner.username}: {description}",
                related_wallet=recipient_wallet
            )

            # Create incoming transaction for recipient
            recipient_txn = Transaction.objects.create(
                wallet=recipient_wallet,
                transaction_type='TRANSFER_IN',
                amount=amount,
                status='COMPLETED',
                description=f"Transfer from {sender_wallet.owner.username}: {description}",
                related_wallet=sender_wallet,
                related_transaction=sender_txn
            )

            # Link transactions
            sender_txn.related_transaction = recipient_txn
            sender_txn.save()

            # Update wallet balances
            sender_wallet.balance -= amount
            sender_wallet.save()

            recipient_wallet.balance += amount
            recipient_wallet.save()

        txn_serializer = TransactionSerializer(sender_txn)
        return Response(txn_serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WalletTransactionListView(generics.ListAPIView):
    """
    List transactions for a specific wallet
    """
    serializer_class = TransactionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        wallet_id = self.kwargs['wallet_id']
        wallet = get_object_or_404(Wallet, id=wallet_id, owner=self.request.user, is_active=True)
        return Transaction.objects.filter(wallet=wallet)


class PiggyBankListCreateView(generics.ListCreateAPIView):
    """
    List user's piggy banks or create a new one
    """
    serializer_class = PiggyBankSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Return piggy banks created by user or where user is a member
        user_created = PiggyBank.objects.filter(creator=self.request.user, is_active=True)
        user_member = PiggyBank.objects.filter(
            members__user=self.request.user,
            members__is_active=True,
            is_active=True
        )
        return (user_created | user_member).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class PiggyBankDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a piggy bank
    """
    serializer_class = PiggyBankSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return PiggyBank.objects.filter(creator=self.request.user, is_active=True)

    def perform_destroy(self, instance):
        # Soft delete - just mark as inactive
        instance.is_active = False
        instance.save()


@extend_schema(
    request=AddMemberSerializer,
    responses={201: PiggyBankMemberSerializer},
    description="Add a member to a piggy bank"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def add_piggybank_member(request, piggybank_id):
    """
    Add a member to a piggy bank
    """
    piggy_bank = get_object_or_404(PiggyBank, id=piggybank_id, creator=request.user, is_active=True)
    serializer = AddMemberSerializer(data=request.data)

    if serializer.is_valid():
        username = serializer.validated_data['username']
        user = get_object_or_404(User, username=username)

        # Check if user is already a member
        if PiggyBankMember.objects.filter(piggy_bank=piggy_bank, user=user).exists():
            return Response(
                {"error": "User is already a member of this piggy bank"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create membership
        member = PiggyBankMember.objects.create(
            piggy_bank=piggy_bank,
            user=user
        )

        member_serializer = PiggyBankMemberSerializer(member)
        return Response(member_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=PiggyBankContributeSerializer,
    responses={201: PiggyBankContributionSerializer},
    description="Contribute money to a piggy bank"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def contribute_to_piggybank(request, piggybank_id):
    """
    Contribute money to a piggy bank
    """
    piggy_bank = get_object_or_404(PiggyBank, id=piggybank_id, is_active=True)

    # Check if user is a member or creator
    is_member = (
        piggy_bank.creator == request.user or
        PiggyBankMember.objects.filter(
            piggy_bank=piggy_bank,
            user=request.user,
            is_active=True
        ).exists()
    )

    if not is_member:
        return Response(
            {"error": "You are not a member of this piggy bank"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = PiggyBankContributeSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        wallet_id = serializer.validated_data['wallet_id']
        amount = serializer.validated_data['amount']

        wallet = get_object_or_404(Wallet, id=wallet_id, owner=request.user, is_active=True)

        # Check if wallet has sufficient balance
        if not wallet.can_debit(amount):
            return Response(
                {"error": "Insufficient balance in wallet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create transaction record
            txn = Transaction.objects.create(
                wallet=wallet,
                transaction_type='PIGGYBANK_CONTRIBUTION',
                amount=amount,
                status='COMPLETED',
                description=f"Contribution to {piggy_bank.name}",
                reference_id=str(piggy_bank.id)
            )

            # Create contribution record
            contribution = PiggyBankContribution.objects.create(
                piggy_bank=piggy_bank,
                contributor=request.user,
                wallet=wallet,
                amount=amount,
                transaction=txn
            )

            # Update wallet balance
            wallet.balance -= amount
            wallet.save()

            # Update piggy bank balance
            piggy_bank.current_amount += amount
            piggy_bank.save()

        contribution_serializer = PiggyBankContributionSerializer(contribution)
        return Response(contribution_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PiggyBankContributionListView(generics.ListAPIView):
    """
    List contributions for a specific piggy bank
    """
    serializer_class = PiggyBankContributionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        piggybank_id = self.kwargs['piggybank_id']
        piggy_bank = get_object_or_404(PiggyBank, id=piggybank_id, is_active=True)

        # Check if user has access to this piggy bank
        is_member = (
            piggy_bank.creator == self.request.user or
            PiggyBankMember.objects.filter(
                piggy_bank=piggy_bank,
                user=self.request.user,
                is_active=True
            ).exists()
        )

        if not is_member:
            return PiggyBankContribution.objects.none()

        return PiggyBankContribution.objects.filter(piggy_bank=piggy_bank)


class PiggyBankMemberListView(generics.ListAPIView):
    """
    List members of a specific piggy bank
    """
    serializer_class = PiggyBankMemberSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        piggybank_id = self.kwargs['piggybank_id']
        piggy_bank = get_object_or_404(PiggyBank, id=piggybank_id, is_active=True)

        # Check if user has access to this piggy bank
        is_member = (
            piggy_bank.creator == self.request.user or
            PiggyBankMember.objects.filter(
                piggy_bank=piggy_bank,
                user=self.request.user,
                is_active=True
            ).exists()
        )

        if not is_member:
            return PiggyBankMember.objects.none()

        return PiggyBankMember.objects.filter(piggy_bank=piggy_bank, is_active=True)


@extend_schema(
    request=PiggyBankPaymentSerializer,
    responses={200: TransactionSerializer},
    description="Make a payment from piggy bank funds to a wallet"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def pay_from_piggybank(request, piggybank_id):
    """
    Make a payment from piggy bank funds to a recipient wallet
    Only the creator of the piggy bank can make payments
    """
    piggy_bank = get_object_or_404(PiggyBank, id=piggybank_id, is_active=True)

    # Only creator can make payments from piggy bank
    if piggy_bank.creator != request.user:
        return Response(
            {"error": "Only the creator of the piggy bank can make payments"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = PiggyBankPaymentSerializer(data=request.data)

    if serializer.is_valid():
        recipient_wallet_id = serializer.validated_data['recipient_wallet_id']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Piggy bank payment')

        recipient_wallet = get_object_or_404(Wallet, id=recipient_wallet_id, is_active=True)

        # Check if piggy bank has sufficient funds
        if piggy_bank.current_amount < amount:
            return Response(
                {"error": "Insufficient funds in piggy bank"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create transaction record for the payment
            txn = Transaction.objects.create(
                wallet=recipient_wallet,
                transaction_type='TRANSFER_IN',
                amount=amount,
                status='COMPLETED',
                description=f"Payment from {piggy_bank.name}: {description}",
                reference_id=str(piggy_bank.id)
            )

            # Update recipient wallet balance
            recipient_wallet.balance += amount
            recipient_wallet.save()

            # Update piggy bank balance
            piggy_bank.current_amount -= amount
            piggy_bank.save()

        txn_serializer = TransactionSerializer(txn)
        return Response(txn_serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
