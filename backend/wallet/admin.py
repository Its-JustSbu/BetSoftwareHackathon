from django.contrib import admin
from .models import Wallet, Transaction, PiggyBank, PiggyBankContribution, PiggyBankMember


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """Admin configuration for Wallet model"""
    list_display = ('name', 'owner', 'balance', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'owner__username', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin configuration for Transaction model"""
    list_display = ('transaction_type', 'amount', 'wallet', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'created_at')
    search_fields = ('wallet__name', 'wallet__owner__username', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(PiggyBank)
class PiggyBankAdmin(admin.ModelAdmin):
    """Admin configuration for PiggyBank model"""
    list_display = ('name', 'creator', 'current_amount', 'target_amount', 'progress_percentage', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'creator__username', 'description')
    readonly_fields = ('id', 'progress_percentage', 'is_target_reached', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(PiggyBankContribution)
class PiggyBankContributionAdmin(admin.ModelAdmin):
    """Admin configuration for PiggyBankContribution model"""
    list_display = ('piggy_bank', 'contributor', 'amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('piggy_bank__name', 'contributor__username')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(PiggyBankMember)
class PiggyBankMemberAdmin(admin.ModelAdmin):
    """Admin configuration for PiggyBankMember model"""
    list_display = ('piggy_bank', 'user', 'is_active', 'invited_at', 'joined_at')
    list_filter = ('is_active', 'invited_at')
    search_fields = ('piggy_bank__name', 'user__username')
    readonly_fields = ('id', 'invited_at')
    ordering = ('-invited_at',)
