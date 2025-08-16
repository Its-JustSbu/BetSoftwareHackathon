from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.email})"

    # KYC-related properties and methods
    @property
    def has_kyc_profile(self):
        """Check if user has a KYC profile"""
        return hasattr(self, 'kyc_profile') and self.kyc_profile is not None

    @property
    def is_kyc_verified(self):
        """Check if user's KYC is verified (approved)"""
        return self.has_kyc_profile and self.kyc_profile.is_verified

    @property 
    def kyc_status(self):
        """Get user's KYC status"""
        if not self.has_kyc_profile:
            return None
        return self.kyc_profile.kyc_status

    @property
    def kyc_verification_level(self):
        """Get user's KYC verification level"""
        if not self.has_kyc_profile:
            return None
        return self.kyc_profile.verification_level

    @property
    def kyc_full_name(self):
        """Get user's full name from KYC profile"""
        if not self.has_kyc_profile:
            return f"{self.first_name} {self.last_name}".strip() if self.first_name or self.last_name else self.username
        return self.kyc_profile.full_name

    def can_perform_transaction(self, amount=None):
        """
        Check if user can perform transactions based on KYC status
        Returns tuple: (can_transact: bool, reason: str)
        """
        if not self.has_kyc_profile:
            return False, "KYC profile required for transactions"
        
        if not self.is_kyc_verified:
            return False, f"KYC verification required. Current status: {self.kyc_status}"
        
        # Add transaction limits based on verification level
        if amount and self.kyc_verification_level == 'BASIC' and float(amount) > 10000:
            return False, "Enhanced KYC verification required for transactions above R10,000"
        
        if amount and self.kyc_verification_level == 'ENHANCED' and float(amount) > 50000:
            return False, "Premium KYC verification required for transactions above R50,000"
        
        return True, "Transaction allowed"

    def get_transaction_limit(self):
        """Get daily transaction limit based on KYC verification level"""
        if not self.is_kyc_verified:
            return 0
        
        limits = {
            'BASIC': 10000,      # R10,000 per day
            'ENHANCED': 50000,   # R50,000 per day
            'PREMIUM': 500000,   # R500,000 per day
        }
        
        return limits.get(self.kyc_verification_level, 0)

    def requires_kyc_upgrade(self, requested_amount):
        """Check if user needs to upgrade KYC level for requested amount"""
        if not self.has_kyc_profile:
            return True, "KYC profile required"
        
        if not self.is_kyc_verified:
            return True, "KYC verification required"
        
        current_limit = self.get_transaction_limit()
        if float(requested_amount) > current_limit:
            if self.kyc_verification_level == 'BASIC':
                return True, "Enhanced KYC verification required"
            elif self.kyc_verification_level == 'ENHANCED':
                return True, "Premium KYC verification required"
        
        return False, "Current KYC level sufficient"

    def get_kyc_summary(self):
        """Get a summary of user's KYC status"""
        if not self.has_kyc_profile:
            return {
                'has_profile': False,
                'status': None,
                'level': None,
                'is_verified': False,
                'transaction_limit': 0,
                'next_step': 'Create KYC profile'
            }
        
        return {
            'has_profile': True,
            'status': self.kyc_status,
            'level': self.kyc_verification_level,
            'is_verified': self.is_kyc_verified,
            'transaction_limit': self.get_transaction_limit(),
            'full_name': self.kyc_full_name,
            'reviewed_at': self.kyc_profile.reviewed_at,
            'next_step': self._get_kyc_next_step()
        }

    def _get_kyc_next_step(self):
        """Get the next step for KYC completion"""
        if not self.has_kyc_profile:
            return 'Create KYC profile'
        
        status = self.kyc_status
        if status == 'PENDING':
            return 'Upload required documents'
        elif status == 'UNDER_REVIEW':
            return 'Wait for review completion'
        elif status == 'APPROVED':
            if self.kyc_verification_level == 'BASIC':
                return 'Upgrade to Enhanced KYC for higher limits'
            elif self.kyc_verification_level == 'ENHANCED':
                return 'Upgrade to Premium KYC for highest limits'
            else:
                return 'KYC fully completed'
        elif status == 'REJECTED':
            return f'Address rejection reason: {self.kyc_profile.rejection_reason}'
        elif status == 'REQUIRES_UPDATE':
            return 'Update profile information as requested'
        
        return 'Contact support for assistance'
