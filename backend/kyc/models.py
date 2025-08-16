from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator
import uuid
import os


def kyc_document_path(instance, filename):
    """Generate upload path for KYC documents"""
    user_id = instance.kyc_profile.user.id
    document_type = instance.document_type.lower()
    ext = filename.split('.')[-1]
    filename = f"{document_type}_{uuid.uuid4().hex}.{ext}"
    return os.path.join('kyc', str(user_id), filename)


class KYCProfile(models.Model):
    """
    KYC Profile for users containing verification information
    """
    KYC_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('REQUIRES_UPDATE', 'Requires Update'),
    ]
    
    VERIFICATION_LEVELS = [
        ('BASIC', 'Basic Verification'),
        ('ENHANCED', 'Enhanced Verification'),
        ('PREMIUM', 'Premium Verification'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='kyc_profile'
    )
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100)
    
    # Identity Information
    id_number = models.CharField(
        max_length=20, 
        unique=True,
        validators=[RegexValidator(
            regex=r'^\d{13}$',
            message='SA ID number must be 13 digits',
        )]
    )
    id_type = models.CharField(
        max_length=50,
        choices=[
            ('SA_ID', 'South African ID'),
            ('PASSPORT', 'Passport'),
            ('DRIVERS_LICENSE', 'Driver\'s License'),
        ],
        default='SA_ID'
    )
    
    # Address Information
    street_address = models.TextField()
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='South Africa')
    
    # Employment Information
    employment_status = models.CharField(
        max_length=50,
        choices=[
            ('EMPLOYED', 'Employed'),
            ('SELF_EMPLOYED', 'Self Employed'),
            ('UNEMPLOYED', 'Unemployed'),
            ('STUDENT', 'Student'),
            ('RETIRED', 'Retired'),
        ]
    )
    employer_name = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # KYC Status
    kyc_status = models.CharField(
        max_length=20,
        choices=KYC_STATUS_CHOICES,
        default='PENDING'
    )
    verification_level = models.CharField(
        max_length=20,
        choices=VERIFICATION_LEVELS,
        default='BASIC'
    )
    
    # Review Information
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kyc_reviews'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"KYC - {self.user.username} ({self.kyc_status})"
    
    @property
    def is_verified(self):
        return self.kyc_status == 'APPROVED'
    
    @property
    def full_name(self):
        middle = f" {self.middle_name}" if self.middle_name else ""
        return f"{self.first_name}{middle} {self.last_name}"


class KYCDocument(models.Model):
    """
    Model for storing KYC documents
    """
    DOCUMENT_TYPES = [
        ('ID_FRONT', 'ID Document Front'),
        ('ID_BACK', 'ID Document Back'),
        ('PASSPORT', 'Passport'),
        ('PROOF_OF_ADDRESS', 'Proof of Address'),
        ('BANK_STATEMENT', 'Bank Statement'),
        ('SELFIE', 'Selfie with ID'),
        ('EMPLOYMENT_LETTER', 'Employment Letter'),
        ('PAYSLIP', 'Payslip'),
    ]
    
    VERIFICATION_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kyc_profile = models.ForeignKey(
        KYCProfile, 
        on_delete=models.CASCADE, 
        related_name='documents'
    )
    
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    document_file = models.FileField(upload_to=kyc_document_path)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    
    # Verification
    status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default='PENDING'
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        unique_together = ['kyc_profile', 'document_type']
        
    def __str__(self):
        return f"{self.kyc_profile.user.username} - {self.get_document_type_display()}"
    
    def save(self, *args, **kwargs):
        if self.document_file:
            self.file_size = self.document_file.size
        super().save(*args, **kwargs)


class KYCVerificationHistory(models.Model):
    """
    Model to track KYC verification history and status changes
    """
    ACTION_TYPES = [
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('UPDATE_REQUESTED', 'Update Requested'),
        ('DOCUMENT_UPLOADED', 'Document Uploaded'),
        ('DOCUMENT_APPROVED', 'Document Approved'),
        ('DOCUMENT_REJECTED', 'Document Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kyc_profile = models.ForeignKey(
        KYCProfile,
        on_delete=models.CASCADE,
        related_name='history'
    )
    
    action = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc_actions'
    )
    
    # Optional reference to specific document
    document = models.ForeignKey(
        KYCDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.kyc_profile.user.username} - {self.get_action_display()}"


class KYCConfiguration(models.Model):
    """
    Configuration settings for KYC process
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # File upload limits
    max_file_size_mb = models.PositiveIntegerField(default=5)  # MB
    allowed_file_types = models.JSONField(
        default=list,
        help_text="List of allowed file extensions, e.g., ['jpg', 'png', 'pdf']"
    )
    
    # Required documents by verification level
    required_documents_basic = models.JSONField(
        default=list,
        help_text="Required document types for basic verification"
    )
    required_documents_enhanced = models.JSONField(
        default=list,
        help_text="Required document types for enhanced verification"
    )
    required_documents_premium = models.JSONField(
        default=list,
        help_text="Required document types for premium verification"
    )
    
    # Auto-approval settings
    enable_auto_approval = models.BooleanField(default=False)
    auto_approval_threshold = models.PositiveIntegerField(
        default=100,
        help_text="Confidence score threshold for auto-approval (0-100)"
    )
    
    # Notification settings
    notify_on_submission = models.BooleanField(default=True)
    notify_on_approval = models.BooleanField(default=True)
    notify_on_rejection = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "KYC Configuration"
        verbose_name_plural = "KYC Configurations"
    
    def save(self, *args, **kwargs):
        # Ensure only one configuration exists
        if not self.pk and KYCConfiguration.objects.exists():
            raise ValueError("Only one KYC configuration can exist")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return "KYC Configuration"
