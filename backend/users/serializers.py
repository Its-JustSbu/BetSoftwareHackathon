from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'phone_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
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
        fields = (
            'id', 'username', 'email', 'phone_number', 'created_at',
            'has_kyc_profile', 'is_kyc_verified', 'kyc_status', 
            'kyc_verification_level', 'kyc_full_name', 'transaction_limit',
            'kyc_summary'
        )
        read_only_fields = ('id', 'created_at')

    def get_transaction_limit(self, obj):
        """Get user's daily transaction limit"""
        return obj.get_transaction_limit()

    def get_kyc_summary(self, obj):
        """Get comprehensive KYC summary"""
        return obj.get_kyc_summary()


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Basic user serializer without KYC details (for public endpoints)
    """
    is_kyc_verified = serializers.ReadOnlyField()
    kyc_full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ('id', 'username', 'is_kyc_verified', 'kyc_full_name', 'created_at')
        read_only_fields = ('id', 'created_at')
