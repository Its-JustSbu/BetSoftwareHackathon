from rest_framework import serializers
from users.models import User
from wallet.models import Wallet, Transaction, PiggyBank, PiggyBankContribution


class UserInfoSerializer(serializers.ModelSerializer):
    """Serializer for user information accessible to bots"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'phone_number', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']


class WalletInfoSerializer(serializers.ModelSerializer):
    """Serializer for wallet information accessible to bots"""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'owner', 'owner_username', 'name', 'balance', 
                 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransactionInfoSerializer(serializers.ModelSerializer):
    """Serializer for transaction information accessible to bots"""
    wallet_owner = serializers.CharField(source='wallet.owner.username', read_only=True)
    related_wallet_owner = serializers.CharField(source='related_wallet.owner.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'wallet', 'wallet_owner', 'transaction_type', 'amount', 
                 'status', 'description', 'reference_id', 'related_wallet', 
                 'related_wallet_owner', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PiggyBankInfoSerializer(serializers.ModelSerializer):
    """Serializer for piggy bank information accessible to bots"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_target_reached = serializers.ReadOnlyField()
    
    class Meta:
        model = PiggyBank
        fields = ['id', 'name', 'description', 'creator', 'creator_username',
                 'target_amount', 'current_amount', 'progress_percentage',
                 'is_target_reached', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSearchSerializer(serializers.Serializer):
    """Serializer for user search parameters"""
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    user_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate(self, attrs):
        """Ensure at least one search parameter is provided"""
        if not any(attrs.values()):
            raise serializers.ValidationError(
                "At least one search parameter must be provided."
            )
        return attrs


class WalletSearchSerializer(serializers.Serializer):
    """Serializer for wallet search parameters"""
    owner_username = serializers.CharField(required=False, allow_blank=True)
    owner_email = serializers.EmailField(required=False, allow_blank=True)
    wallet_id = serializers.UUIDField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False, allow_null=True)
    
    def validate(self, attrs):
        """Ensure at least one search parameter is provided"""
        if not any(value is not None and value != '' for value in attrs.values()):
            raise serializers.ValidationError(
                "At least one search parameter must be provided."
            )
        return attrs
