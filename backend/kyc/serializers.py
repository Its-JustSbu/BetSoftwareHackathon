from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import KYCProfile, KYCDocument, KYCVerificationHistory, KYCConfiguration

User = get_user_model()


class KYCDocumentSerializer(serializers.ModelSerializer):
    """Serializer for KYC documents"""
    
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = KYCDocument
        fields = [
            'id', 'document_type', 'document_type_display', 
            'document_file', 'file_size', 'file_size_mb',
            'status', 'status_display', 'verified_by', 'verified_at',
            'rejection_reason', 'uploaded_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_size', 'verified_by', 'verified_at', 
            'uploaded_at', 'updated_at'
        ]
    
    def get_file_size_mb(self, obj):
        """Convert file size to MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def validate_document_file(self, value):
        """Validate document file"""
        # Check file size (5MB limit)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 5MB")
        
        # Check file type
        allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value


class KYCVerificationHistorySerializer(serializers.ModelSerializer):
    """Serializer for KYC verification history"""
    
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)
    document_type = serializers.CharField(source='document.document_type', read_only=True)
    
    class Meta:
        model = KYCVerificationHistory
        fields = [
            'id', 'action', 'action_display', 'description',
            'performed_by', 'performed_by_username', 'document',
            'document_type', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class KYCProfileSerializer(serializers.ModelSerializer):
    """Serializer for KYC profiles"""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    verification_level_display = serializers.CharField(source='get_verification_level_display', read_only=True)
    employment_status_display = serializers.CharField(source='get_employment_status_display', read_only=True)
    id_type_display = serializers.CharField(source='get_id_type_display', read_only=True)
    full_name = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    
    documents = KYCDocumentSerializer(many=True, read_only=True)
    history = KYCVerificationHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = KYCProfile
        fields = [
            'id', 'user', 'user_username', 'user_email',
            'first_name', 'last_name', 'middle_name', 'full_name',
            'date_of_birth', 'nationality', 'id_number', 'id_type', 'id_type_display',
            'street_address', 'city', 'province', 'postal_code', 'country',
            'employment_status', 'employment_status_display', 'employer_name',
            'job_title', 'monthly_income', 'kyc_status', 'kyc_status_display',
            'verification_level', 'verification_level_display', 'is_verified',
            'reviewed_by', 'reviewed_at', 'rejection_reason', 'notes',
            'created_at', 'updated_at', 'documents', 'history'
        ]
        read_only_fields = [
            'id', 'user', 'reviewed_by', 'reviewed_at', 
            'created_at', 'updated_at'
        ]
    
    def validate_id_number(self, value):
        """Validate South African ID number"""
        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("SA ID number must be exactly 13 digits")
        
        # Check if ID number already exists for a different user
        user = self.context['request'].user
        existing = KYCProfile.objects.filter(id_number=value).exclude(user=user).first()
        if existing:
            raise serializers.ValidationError("This ID number is already registered")
        
        return value
    
    def validate_date_of_birth(self, value):
        """Validate date of birth"""
        from datetime import date
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        
        if age < 18:
            raise serializers.ValidationError("User must be at least 18 years old")
        if age > 120:
            raise serializers.ValidationError("Invalid date of birth")
        
        return value


class KYCProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating KYC profiles"""
    
    class Meta:
        model = KYCProfile
        fields = [
            'first_name', 'last_name', 'middle_name', 'date_of_birth',
            'nationality', 'id_number', 'id_type', 'street_address',
            'city', 'province', 'postal_code', 'country',
            'employment_status', 'employer_name', 'job_title', 'monthly_income'
        ]
    
    def validate_id_number(self, value):
        """Validate South African ID number"""
        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("SA ID number must be exactly 13 digits")
        
        # Check if ID number already exists
        if KYCProfile.objects.filter(id_number=value).exists():
            raise serializers.ValidationError("This ID number is already registered")
        
        return value
    
    def create(self, validated_data):
        """Create KYC profile and link to current user"""
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class KYCStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating KYC status (admin only)"""
    
    class Meta:
        model = KYCProfile
        fields = ['kyc_status', 'verification_level', 'rejection_reason', 'notes']
    
    def validate(self, data):
        if data.get('kyc_status') == 'REJECTED' and not data.get('rejection_reason'):
            raise serializers.ValidationError("Rejection reason is required when rejecting KYC")
        return data


class KYCDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading KYC documents"""
    
    class Meta:
        model = KYCDocument
        fields = ['document_type', 'document_file']
    
    def validate(self, data):
        """Validate that user doesn't already have this document type"""
        user = self.context['request'].user
        if hasattr(user, 'kyc_profile'):
            existing = KYCDocument.objects.filter(
                kyc_profile=user.kyc_profile,
                document_type=data['document_type']
            ).first()
            if existing:
                raise serializers.ValidationError(
                    "Document of this type already exists. Please delete the existing one first."
                )
        else:
            raise serializers.ValidationError("User must have a KYC profile before uploading documents")
        
        return data
    
    def create(self, validated_data):
        """Create document and link to user's KYC profile"""
        user = self.context['request'].user
        validated_data['kyc_profile'] = user.kyc_profile
        return super().create(validated_data)


class KYCConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for KYC configuration"""
    
    class Meta:
        model = KYCConfiguration
        fields = [
            'id', 'max_file_size_mb', 'allowed_file_types',
            'required_documents_basic', 'required_documents_enhanced',
            'required_documents_premium', 'enable_auto_approval',
            'auto_approval_threshold', 'notify_on_submission',
            'notify_on_approval', 'notify_on_rejection',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class KYCSummarySerializer(serializers.Serializer):
    """Serializer for KYC summary statistics"""
    
    total_profiles = serializers.IntegerField()
    pending_reviews = serializers.IntegerField()
    approved_profiles = serializers.IntegerField()
    rejected_profiles = serializers.IntegerField()
    under_review = serializers.IntegerField()
    requires_update = serializers.IntegerField()
    total_documents = serializers.IntegerField()
    pending_documents = serializers.IntegerField()
    approved_documents = serializers.IntegerField()
    rejected_documents = serializers.IntegerField()
