from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from .models import KYCProfile, KYCDocument, KYCVerificationHistory, KYCConfiguration


@admin.register(KYCProfile)
class KYCProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'full_name', 'kyc_status', 'verification_level',
        'is_verified', 'created_at', 'reviewed_at'
    ]
    list_filter = [
        'kyc_status', 'verification_level', 'nationality',
        'employment_status', 'created_at', 'reviewed_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'first_name', 'last_name',
        'id_number', 'employer_name'
    ]
    readonly_fields = [
        'id', 'user', 'created_at', 'updated_at', 'full_name'
    ]
    
    fieldsets = (
        ('User Information', {
            'fields': ('id', 'user', 'created_at', 'updated_at')
        }),
        ('Personal Information', {
            'fields': (
                ('first_name', 'last_name', 'middle_name'),
                'full_name', 'date_of_birth', 'nationality'
            )
        }),
        ('Identity Information', {
            'fields': ('id_number', 'id_type')
        }),
        ('Address Information', {
            'fields': (
                'street_address', ('city', 'province'),
                ('postal_code', 'country')
            )
        }),
        ('Employment Information', {
            'fields': (
                'employment_status', 'employer_name',
                'job_title', 'monthly_income'
            )
        }),
        ('KYC Status', {
            'fields': (
                ('kyc_status', 'verification_level'),
                ('reviewed_by', 'reviewed_at'),
                'rejection_reason', 'notes'
            )
        }),
    )
    
    actions = ['approve_kyc', 'reject_kyc', 'request_update']
    
    def approve_kyc(self, request, queryset):
        count = 0
        for profile in queryset:
            if profile.kyc_status != 'APPROVED':
                profile.kyc_status = 'APPROVED'
                profile.reviewed_by = request.user
                profile.reviewed_at = timezone.now()
                profile.save()
                
                # Create history entry
                KYCVerificationHistory.objects.create(
                    kyc_profile=profile,
                    action='APPROVED',
                    description='KYC approved via admin action',
                    performed_by=request.user
                )
                count += 1
        
        self.message_user(request, f'{count} KYC profiles approved successfully.')
    approve_kyc.short_description = "Approve selected KYC profiles"
    
    def reject_kyc(self, request, queryset):
        count = 0
        for profile in queryset:
            if profile.kyc_status != 'REJECTED':
                profile.kyc_status = 'REJECTED'
                profile.reviewed_by = request.user
                profile.reviewed_at = timezone.now()
                profile.rejection_reason = "Rejected via admin bulk action"
                profile.save()
                
                # Create history entry
                KYCVerificationHistory.objects.create(
                    kyc_profile=profile,
                    action='REJECTED',
                    description='KYC rejected via admin action',
                    performed_by=request.user
                )
                count += 1
        
        self.message_user(request, f'{count} KYC profiles rejected.')
    reject_kyc.short_description = "Reject selected KYC profiles"
    
    def request_update(self, request, queryset):
        count = 0
        for profile in queryset:
            profile.kyc_status = 'REQUIRES_UPDATE'
            profile.reviewed_by = request.user
            profile.reviewed_at = timezone.now()
            profile.save()
            
            # Create history entry
            KYCVerificationHistory.objects.create(
                kyc_profile=profile,
                action='UPDATE_REQUESTED',
                description='Update requested via admin action',
                performed_by=request.user
            )
            count += 1
        
        self.message_user(request, f'{count} KYC profiles marked for update.')
    request_update.short_description = "Request update for selected KYC profiles"


class KYCDocumentInline(admin.TabularInline):
    model = KYCDocument
    extra = 0
    readonly_fields = ['id', 'file_size', 'uploaded_at', 'updated_at']
    fields = [
        'document_type', 'document_file', 'status',
        'verified_by', 'verified_at', 'rejection_reason'
    ]


@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'kyc_profile', 'document_type', 'status',
        'file_size_display', 'uploaded_at', 'verified_by'
    ]
    list_filter = [
        'document_type', 'status', 'uploaded_at', 'verified_at'
    ]
    search_fields = [
        'kyc_profile__user__username', 'kyc_profile__first_name',
        'kyc_profile__last_name', 'document_type'
    ]
    readonly_fields = [
        'id', 'file_size', 'uploaded_at', 'updated_at', 'file_size_display'
    ]
    
    fieldsets = (
        ('Document Information', {
            'fields': (
                'id', 'kyc_profile', 'document_type',
                'document_file', 'file_size', 'file_size_display'
            )
        }),
        ('Verification', {
            'fields': (
                'status', 'verified_by', 'verified_at',
                'rejection_reason'
            )
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at')
        }),
    )
    
    def file_size_display(self, obj):
        if obj.file_size:
            return f"{obj.file_size / (1024 * 1024):.2f} MB"
        return "Unknown"
    file_size_display.short_description = "File Size"
    
    actions = ['approve_documents', 'reject_documents']
    
    def approve_documents(self, request, queryset):
        from django.utils import timezone
        count = 0
        for document in queryset:
            if document.status != 'APPROVED':
                document.status = 'APPROVED'
                document.verified_by = request.user
                document.verified_at = timezone.now()
                document.save()
                
                # Create history entry
                KYCVerificationHistory.objects.create(
                    kyc_profile=document.kyc_profile,
                    action='DOCUMENT_APPROVED',
                    description=f'Document {document.get_document_type_display()} approved',
                    performed_by=request.user,
                    document=document
                )
                count += 1
        
        self.message_user(request, f'{count} documents approved successfully.')
    approve_documents.short_description = "Approve selected documents"
    
    def reject_documents(self, request, queryset):
        from django.utils import timezone
        count = 0
        for document in queryset:
            if document.status != 'REJECTED':
                document.status = 'REJECTED'
                document.verified_by = request.user
                document.verified_at = timezone.now()
                document.rejection_reason = "Rejected via admin bulk action"
                document.save()
                
                # Create history entry
                KYCVerificationHistory.objects.create(
                    kyc_profile=document.kyc_profile,
                    action='DOCUMENT_REJECTED',
                    description=f'Document {document.get_document_type_display()} rejected',
                    performed_by=request.user,
                    document=document
                )
                count += 1
        
        self.message_user(request, f'{count} documents rejected.')
    reject_documents.short_description = "Reject selected documents"


@admin.register(KYCVerificationHistory)
class KYCVerificationHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'kyc_profile', 'action', 'performed_by',
        'document', 'timestamp'
    ]
    list_filter = [
        'action', 'timestamp', 'performed_by'
    ]
    search_fields = [
        'kyc_profile__user__username', 'kyc_profile__first_name',
        'kyc_profile__last_name', 'description'
    ]
    readonly_fields = ['id', 'timestamp']
    
    fieldsets = (
        ('Action Information', {
            'fields': (
                'id', 'kyc_profile', 'action', 'description',
                'performed_by', 'document', 'timestamp'
            )
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(KYCConfiguration)
class KYCConfigurationAdmin(admin.ModelAdmin):
    list_display = [
        'max_file_size_mb', 'enable_auto_approval',
        'auto_approval_threshold', 'created_at', 'updated_at'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('File Upload Settings', {
            'fields': ('max_file_size_mb', 'allowed_file_types')
        }),
        ('Required Documents', {
            'fields': (
                'required_documents_basic',
                'required_documents_enhanced',
                'required_documents_premium'
            )
        }),
        ('Auto Approval', {
            'fields': ('enable_auto_approval', 'auto_approval_threshold')
        }),
        ('Notifications', {
            'fields': (
                'notify_on_submission', 'notify_on_approval',
                'notify_on_rejection'
            )
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one configuration
        return not KYCConfiguration.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


# Add KYC profile inline to User admin if it exists
try:
    from django.contrib.auth.admin import UserAdmin
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    class KYCProfileInline(admin.StackedInline):
        model = KYCProfile
        fk_name = 'user'  # Specify which foreign key to use
        extra = 0
        readonly_fields = [
            'id', 'kyc_status', 'verification_level',
            'reviewed_by', 'reviewed_at', 'created_at', 'updated_at'
        ]
        fieldsets = (
            ('Personal Info', {
                'fields': (
                    ('first_name', 'last_name', 'middle_name'),
                    'date_of_birth', 'nationality'
                )
            }),
            ('Identity', {
                'fields': ('id_number', 'id_type')
            }),
            ('KYC Status', {
                'fields': (
                    ('kyc_status', 'verification_level'),
                    ('reviewed_by', 'reviewed_at'),
                    'rejection_reason'
                )
            }),
            ('Metadata', {
                'fields': ('id', 'created_at', 'updated_at'),
                'classes': ('collapse',)
            }),
        )
    
    # Try to unregister and re-register User admin with KYC inline
    try:
        admin.site.unregister(User)
    except:
        pass
    
    @admin.register(User)
    class CustomUserAdmin(UserAdmin):
        inlines = [KYCProfileInline] + list(UserAdmin.inlines or [])
        
except:
    # If User admin customization fails, continue without it
    pass
