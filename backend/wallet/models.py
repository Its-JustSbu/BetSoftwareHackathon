from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class Wallet(models.Model):
    """
    Wallet model for storing user's money
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallets')
    name = models.CharField(max_length=100, default='My Wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.username}'s {self.name} - R{self.balance}"

    def can_debit(self, amount):
        """Check if wallet has sufficient balance for debit"""
        return self.balance >= amount


class Transaction(models.Model):
    """
    Transaction model for tracking all money movements
    """
    TRANSACTION_TYPES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('TRANSFER_OUT', 'Transfer Out'),
        ('TRANSFER_IN', 'Transfer In'),
        ('PIGGYBANK_CONTRIBUTION', 'Piggy Bank Contribution'),
    ]

    TRANSACTION_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=25, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    status = models.CharField(max_length=10, choices=TRANSACTION_STATUS, default='PENDING')
    description = models.TextField(blank=True)
    reference_id = models.CharField(max_length=100, blank=True, null=True)  # For external references
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # For transfers - link to the other party
    related_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_transactions')
    related_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - R{self.amount} - {self.wallet.owner.username}"


class PiggyBank(models.Model):
    """
    PiggyBank model for shared bill splitting
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_piggybanks')
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - R{self.current_amount}/R{self.target_amount}"

    @property
    def progress_percentage(self):
        """Calculate the progress percentage"""
        if self.target_amount > 0:
            return min((self.current_amount / self.target_amount) * 100, 100)
        return 0

    @property
    def is_target_reached(self):
        """Check if target amount is reached"""
        return self.current_amount >= self.target_amount


class PiggyBankContribution(models.Model):
    """
    Model to track individual contributions to a piggy bank
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    piggy_bank = models.ForeignKey(PiggyBank, on_delete=models.CASCADE, related_name='contributions')
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='piggybank_contributions')
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='piggybank_contributions')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='piggybank_contribution')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.contributor.username} contributed R{self.amount} to {self.piggy_bank.name}"


class PiggyBankMember(models.Model):
    """
    Model to track members who can contribute to a piggy bank
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    piggy_bank = models.ForeignKey(PiggyBank, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='piggybank_memberships')
    invited_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['piggy_bank', 'user']
        ordering = ['-invited_at']

    def __str__(self):
        return f"{self.user.username} in {self.piggy_bank.name}"
