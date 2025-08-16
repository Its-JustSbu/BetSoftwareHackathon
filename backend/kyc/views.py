from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import KYCProfile, KYCDocument, KYCVerificationHistory, KYCConfiguration
from .serializers import (
    KYCProfileSerializer, KYCProfileCreateSerializer, KYCStatusUpdateSerializer,
    KYCDocumentSerializer, KYCDocumentUploadSerializer, KYCVerificationHistorySerializer,
    KYCConfigurationSerializer, KYCSummarySerializer
)

User = get_user_model()


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users can access everything
        if request.user.is_staff:
            return True
        
        # Users can only access their own KYC data
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'kyc_profile'):
            return obj.kyc_profile.user == request.user
        
        return False


# KYC Profile Views
class KYCProfileCreateView(generics.CreateAPIView):
    """Create KYC profile for the current user"""
    serializer_class = KYCProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Check if user already has a KYC profile
        if hasattr(request.user, 'kyc_profile'):
            return Response(
                {'error': 'User already has a KYC profile'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            # Create verification history entry
            kyc_profile = KYCProfile.objects.get(user=request.user)
            KYCVerificationHistory.objects.create(
                kyc_profile=kyc_profile,
                action='SUBMITTED',
                description='KYC profile submitted for review',
                performed_by=request.user
            )
        
        return response


class KYCProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get or update user's KYC profile"""
    serializer_class = KYCProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_object(self):
        return get_object_or_404(KYCProfile, user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        # Only allow updates if status is not approved
        kyc_profile = self.get_object()
        if kyc_profile.kyc_status == 'APPROVED':
            return Response(
                {'error': 'Cannot update approved KYC profile'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            # Reset status to pending after update
            kyc_profile.kyc_status = 'PENDING'
            kyc_profile.save()
            
            # Create verification history entry
            KYCVerificationHistory.objects.create(
                kyc_profile=kyc_profile,
                action='UPDATE_REQUESTED',
                description='KYC profile updated and resubmitted for review',
                performed_by=request.user
            )
        
        return response


class KYCProfileListView(generics.ListAPIView):
    """List all KYC profiles (admin only)"""
    serializer_class = KYCProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['kyc_status', 'verification_level', 'nationality']
    search_fields = ['user__username', 'user__email', 'first_name', 'last_name', 'id_number']
    ordering_fields = ['created_at', 'updated_at', 'reviewed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return KYCProfile.objects.select_related('user', 'reviewed_by').prefetch_related('documents', 'history')


class KYCProfileAdminDetailView(generics.RetrieveUpdateAPIView):
    """Get or update any KYC profile (admin only)"""
    serializer_class = KYCProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
    
    def get_queryset(self):
        return KYCProfile.objects.select_related('user', 'reviewed_by').prefetch_related('documents', 'history')


# KYC Status Update Views
class KYCStatusUpdateView(generics.UpdateAPIView):
    """Update KYC status (admin only)"""
    serializer_class = KYCStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
    queryset = KYCProfile.objects.all()
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            kyc_profile = self.get_object()
            kyc_profile.reviewed_by = request.user
            kyc_profile.reviewed_at = timezone.now()
            kyc_profile.save()
            
            # Create verification history entry
            action_map = {
                'APPROVED': 'APPROVED',
                'REJECTED': 'REJECTED',
                'UNDER_REVIEW': 'UNDER_REVIEW',
                'REQUIRES_UPDATE': 'UPDATE_REQUESTED'
            }
            
            action = action_map.get(kyc_profile.kyc_status, 'UNDER_REVIEW')
            KYCVerificationHistory.objects.create(
                kyc_profile=kyc_profile,
                action=action,
                description=f'KYC status changed to {kyc_profile.get_kyc_status_display()}',
                performed_by=request.user
            )
        
        return response


# Document Views
class KYCDocumentListView(generics.ListAPIView):
    """List user's KYC documents"""
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'kyc_profile'):
            return KYCDocument.objects.none()
        return KYCDocument.objects.filter(kyc_profile=self.request.user.kyc_profile)


class KYCDocumentUploadView(generics.CreateAPIView):
    """Upload KYC document"""
    serializer_class = KYCDocumentUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        if not hasattr(request.user, 'kyc_profile'):
            return Response(
                {'error': 'User must have a KYC profile before uploading documents'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            # Create verification history entry
            document = KYCDocument.objects.get(id=response.data['id'])
            KYCVerificationHistory.objects.create(
                kyc_profile=request.user.kyc_profile,
                action='DOCUMENT_UPLOADED',
                description=f'Document uploaded: {document.get_document_type_display()}',
                performed_by=request.user,
                document=document
            )
        
        return response


class KYCDocumentDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete KYC document"""
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return KYCDocument.objects.all()
        elif hasattr(self.request.user, 'kyc_profile'):
            return KYCDocument.objects.filter(kyc_profile=self.request.user.kyc_profile)
        return KYCDocument.objects.none()


class KYCDocumentVerifyView(generics.UpdateAPIView):
    """Verify/reject KYC document (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    queryset = KYCDocument.objects.all()
    
    def update(self, request, *args, **kwargs):
        document = self.get_object()
        new_status = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason', '')
        
        if new_status not in ['APPROVED', 'REJECTED']:
            return Response(
                {'error': 'Status must be either APPROVED or REJECTED'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status == 'REJECTED' and not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document.status = new_status
        document.rejection_reason = rejection_reason
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()
        
        # Create verification history entry
        action = 'DOCUMENT_APPROVED' if new_status == 'APPROVED' else 'DOCUMENT_REJECTED'
        KYCVerificationHistory.objects.create(
            kyc_profile=document.kyc_profile,
            action=action,
            description=f'Document {document.get_document_type_display()} {new_status.lower()}',
            performed_by=request.user,
            document=document
        )
        
        serializer = KYCDocumentSerializer(document)
        return Response(serializer.data)


# History Views
class KYCHistoryListView(generics.ListAPIView):
    """List KYC verification history for user"""
    serializer_class = KYCVerificationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'kyc_profile'):
            return KYCVerificationHistory.objects.none()
        return KYCVerificationHistory.objects.filter(kyc_profile=self.request.user.kyc_profile)


# Statistics Views
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def kyc_summary_stats(request):
    """Get KYC summary statistics"""
    
    # Profile statistics
    profile_stats = KYCProfile.objects.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(kyc_status='PENDING')),
        under_review=Count('id', filter=Q(kyc_status='UNDER_REVIEW')),
        approved=Count('id', filter=Q(kyc_status='APPROVED')),
        rejected=Count('id', filter=Q(kyc_status='REJECTED')),
        requires_update=Count('id', filter=Q(kyc_status='REQUIRES_UPDATE'))
    )
    
    # Document statistics
    document_stats = KYCDocument.objects.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='PENDING')),
        approved=Count('id', filter=Q(status='APPROVED')),
        rejected=Count('id', filter=Q(status='REJECTED'))
    )
    
    data = {
        'total_profiles': profile_stats['total'],
        'pending_reviews': profile_stats['pending'],
        'under_review': profile_stats['under_review'],
        'approved_profiles': profile_stats['approved'],
        'rejected_profiles': profile_stats['rejected'],
        'requires_update': profile_stats['requires_update'],
        'total_documents': document_stats['total'],
        'pending_documents': document_stats['pending'],
        'approved_documents': document_stats['approved'],
        'rejected_documents': document_stats['rejected']
    }
    
    serializer = KYCSummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def kyc_status_check(request):
    """Check current user's KYC status"""
    
    if not hasattr(request.user, 'kyc_profile'):
        return Response({
            'has_kyc_profile': False,
            'kyc_status': None,
            'verification_level': None,
            'is_verified': False,
            'required_documents': [],
            'uploaded_documents': []
        })
    
    kyc_profile = request.user.kyc_profile
    documents = kyc_profile.documents.all()
    
    # Get required documents based on verification level
    try:
        config = KYCConfiguration.objects.first()
        if config:
            level_map = {
                'BASIC': config.required_documents_basic,
                'ENHANCED': config.required_documents_enhanced,
                'PREMIUM': config.required_documents_premium
            }
            required_docs = level_map.get(kyc_profile.verification_level, [])
        else:
            required_docs = ['ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'SELFIE']
    except:
        required_docs = ['ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'SELFIE']
    
    uploaded_docs = [doc.document_type for doc in documents]
    missing_docs = [doc for doc in required_docs if doc not in uploaded_docs]
    
    return Response({
        'has_kyc_profile': True,
        'kyc_status': kyc_profile.kyc_status,
        'kyc_status_display': kyc_profile.get_kyc_status_display(),
        'verification_level': kyc_profile.verification_level,
        'verification_level_display': kyc_profile.get_verification_level_display(),
        'is_verified': kyc_profile.is_verified,
        'required_documents': required_docs,
        'uploaded_documents': uploaded_docs,
        'missing_documents': missing_docs,
        'documents_complete': len(missing_docs) == 0,
        'profile_data': KYCProfileSerializer(kyc_profile).data
    })


# Configuration Views
class KYCConfigurationView(generics.RetrieveUpdateAPIView):
    """Get or update KYC configuration (admin only)"""
    serializer_class = KYCConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_object(self):
        config, created = KYCConfiguration.objects.get_or_create(
            defaults={
                'max_file_size_mb': 5,
                'allowed_file_types': ['jpg', 'jpeg', 'png', 'pdf'],
                'required_documents_basic': ['ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'SELFIE'],
                'required_documents_enhanced': ['ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'SELFIE', 'BANK_STATEMENT'],
                'required_documents_premium': ['ID_FRONT', 'ID_BACK', 'PROOF_OF_ADDRESS', 'SELFIE', 'BANK_STATEMENT', 'EMPLOYMENT_LETTER'],
                'enable_auto_approval': False,
                'auto_approval_threshold': 95
            }
        )
        return config
