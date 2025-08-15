from rest_framework import serializers
from decimal import Decimal
from .models import Wallet, Transaction, PiggyBank, PiggyBankContribution, PiggyBankMember
from users.serializers import UserSerializer


class WalletSerializer(serializers.ModelSerializer):
    """
    Serializer for Wallet model
    """
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Wallet
        fields = ('id', 'owner', 'name', 'balance', 'created_at', 'updated_at', 'is_active')
        read_only_fields = ('id', 'owner', 'balance', 'created_at', 'updated_at')


class WalletCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new wallet
    """
    class Meta:
        model = Wallet
        fields = ('id', 'name', 'balance', 'created_at')
        read_only_fields = ('id', 'balance', 'created_at')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model
    """
    wallet_owner = serializers.CharField(source='wallet.owner.username', read_only=True)
    related_wallet_owner = serializers.CharField(source='related_wallet.owner.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'wallet', 'wallet_owner', 'transaction_type', 'amount', 'status', 
                 'description', 'reference_id', 'related_wallet', 'related_wallet_owner', 
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'wallet', 'wallet_owner', 'related_wallet_owner', 
                           'created_at', 'updated_at')


class DepositSerializer(serializers.Serializer):
    """
    Serializer for depositing money into a wallet
    """
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    description = serializers.CharField(max_length=255, required=False, default='Wallet deposit')


class TransferSerializer(serializers.Serializer):
    """
    Serializer for transferring money between wallets
    """
    recipient_wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    description = serializers.CharField(max_length=255, required=False, default='Peer-to-peer transfer')

    def validate_recipient_wallet_id(self, value):
        try:
            wallet = Wallet.objects.get(id=value, is_active=True)
            return value
        except Wallet.DoesNotExist:
            raise serializers.ValidationError("Recipient wallet not found or inactive")


class PiggyBankSerializer(serializers.ModelSerializer):
    """
    Serializer for PiggyBank model
    """
    creator = UserSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_target_reached = serializers.ReadOnlyField()
    members_count = serializers.SerializerMethodField()
    contributions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PiggyBank
        fields = ('id', 'name', 'description', 'creator', 'target_amount', 'current_amount',
                 'progress_percentage', 'is_target_reached', 'members_count', 'contributions_count',
                 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'creator', 'current_amount', 'is_active', 'created_at', 'updated_at')

    def get_members_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_contributions_count(self, obj):
        return obj.contributions.count()

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class PiggyBankContributionSerializer(serializers.ModelSerializer):
    """
    Serializer for PiggyBank contributions
    """
    contributor = UserSerializer(read_only=True)
    piggy_bank_name = serializers.CharField(source='piggy_bank.name', read_only=True)
    
    class Meta:
        model = PiggyBankContribution
        fields = ('id', 'piggy_bank', 'piggy_bank_name', 'contributor', 'wallet', 'amount', 'created_at')
        read_only_fields = ('id', 'piggy_bank_name', 'contributor', 'created_at')


class PiggyBankContributeSerializer(serializers.Serializer):
    """
    Serializer for contributing to a piggy bank
    """
    wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))

    def validate_wallet_id(self, value):
        user = self.context['request'].user
        try:
            wallet = Wallet.objects.get(id=value, owner=user, is_active=True)
            return value
        except Wallet.DoesNotExist:
            raise serializers.ValidationError("Wallet not found or you don't have permission to use it")


class PiggyBankMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for PiggyBank members
    """
    user = UserSerializer(read_only=True)
    piggy_bank_name = serializers.CharField(source='piggy_bank.name', read_only=True)
    
    class Meta:
        model = PiggyBankMember
        fields = ('id', 'piggy_bank', 'piggy_bank_name', 'user', 'invited_at', 'joined_at', 'is_active')
        read_only_fields = ('id', 'piggy_bank_name', 'user', 'invited_at', 'joined_at')


class AddMemberSerializer(serializers.Serializer):
    """
    Serializer for adding members to a piggy bank
    """
    username = serializers.CharField()

    def validate_username(self, value):
        from users.models import User
        try:
            user = User.objects.get(username=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")


class PiggyBankPaymentSerializer(serializers.Serializer):
    """
    Serializer for making payments from a piggy bank
    """
    recipient_wallet_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    description = serializers.CharField(max_length=255, required=False, default='Piggy bank payment')

    def validate_recipient_wallet_id(self, value):
        try:
            wallet = Wallet.objects.get(id=value, is_active=True)
            return value
        except Wallet.DoesNotExist:
            raise serializers.ValidationError("Recipient wallet not found or inactive")
