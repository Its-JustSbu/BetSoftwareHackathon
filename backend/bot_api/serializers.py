from rest_framework import serializers
from users.models import User
from wallet.models import Wallet, Transaction, PiggyBank, PiggyBankContribution


class UserInfoSerializer(serializers.ModelSerializer):
    """Serializer for user information accessible to bots"""
    
    # KYC-related fields
    has_kyc_profile = serializers.ReadOnlyField()
    is_kyc_verified = serializers.ReadOnlyField()
    kyc_status = serializers.ReadOnlyField()
    kyc_verification_level = serializers.ReadOnlyField()
    kyc_full_name = serializers.ReadOnlyField()
    transaction_limit = serializers.SerializerMethodField()
    kyc_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone_number', 'created_at', 'is_active',
            # KYC fields
            'has_kyc_profile', 'is_kyc_verified', 'kyc_status', 
            'kyc_verification_level', 'kyc_full_name', 'transaction_limit',
            'kyc_summary'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_transaction_limit(self, obj):
        """Get user's daily transaction limit based on KYC level"""
        return obj.get_transaction_limit()
    
    def get_kyc_summary(self, obj):
        """Get comprehensive KYC summary for bot access"""
        return obj.get_kyc_summary()


class WalletInfoSerializer(serializers.ModelSerializer):
    """Serializer for wallet information accessible to bots"""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_kyc_status = serializers.CharField(source='owner.kyc_status', read_only=True)
    owner_verification_level = serializers.CharField(source='owner.kyc_verification_level', read_only=True)
    owner_transaction_limit = serializers.SerializerMethodField()
    can_transact_1k = serializers.SerializerMethodField()
    can_transact_10k = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'owner', 'owner_username', 'name', 'balance', 
            'created_at', 'updated_at', 'is_active',
            # KYC-related fields
            'owner_kyc_status', 'owner_verification_level', 
            'owner_transaction_limit', 'can_transact_1k', 'can_transact_10k'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_owner_transaction_limit(self, obj):
        """Get owner's transaction limit"""
        return obj.owner.get_transaction_limit()
    
    def get_can_transact_1k(self, obj):
        """Check if owner can transact R1,000"""
        can_transact, reason = obj.owner.can_perform_transaction(1000)
        return {'allowed': can_transact, 'reason': reason}
    
    def get_can_transact_10k(self, obj):
        """Check if owner can transact R10,000"""
        can_transact, reason = obj.owner.can_perform_transaction(10000)
        return {'allowed': can_transact, 'reason': reason}


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
    kyc_verified_only = serializers.BooleanField(required=False, default=False)
    min_kyc_level = serializers.ChoiceField(
        choices=[('BASIC', 'Basic'), ('ENHANCED', 'Enhanced'), ('PREMIUM', 'Premium')],
        required=False,
        allow_blank=True
    )
    
    def validate(self, attrs):
        """Ensure at least one search parameter is provided"""
        if not any(value is not None and value != '' for value in attrs.values()):
            raise serializers.ValidationError(
                "At least one search parameter must be provided."
            )
        return attrs


class KYCProfileSerializer(serializers.Serializer):
    """Serializer for KYC profile information accessible to bots"""
    id = serializers.UUIDField()
    user_id = serializers.UUIDField(source='user.id')
    username = serializers.CharField(source='user.username')
    kyc_status = serializers.CharField()
    verification_level = serializers.CharField()
    is_verified = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()
    reviewed_at = serializers.DateTimeField()
    reviewed_by = serializers.CharField(source='reviewed_by.username', allow_null=True)
    rejection_reason = serializers.CharField()


class KYCDocumentSerializer(serializers.Serializer):
    """Serializer for KYC document information accessible to bots"""
    id = serializers.UUIDField()
    kyc_profile_id = serializers.UUIDField(source='kyc_profile.id')
    document_type = serializers.CharField()
    status = serializers.CharField()
    file_size = serializers.IntegerField()
    uploaded_at = serializers.DateTimeField()
    verified_at = serializers.DateTimeField()
    verified_by = serializers.CharField(source='verified_by.username', allow_null=True)


class TransactionValidationSerializer(serializers.Serializer):
    """Serializer for transaction validation requests"""
    user_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = serializers.ChoiceField(
        choices=[
            ('DEPOSIT', 'Deposit'),
            ('TRANSFER_OUT', 'Transfer Out'),
            ('WITHDRAWAL', 'Withdrawal'),
            ('PIGGYBANK_CONTRIBUTION', 'Piggy Bank Contribution'),
        ],
        default='TRANSFER_OUT'
    )
