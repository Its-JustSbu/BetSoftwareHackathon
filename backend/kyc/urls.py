from django.urls import path
from . import views

app_name = 'kyc'

urlpatterns = [
    # Profile management
    path('profile/create/', views.KYCProfileCreateView.as_view(), name='profile_create'),
    path('profile/', views.KYCProfileDetailView.as_view(), name='profile_detail'),
    path('status/', views.kyc_status_check, name='status_check'),
    
    # Document management
    path('documents/', views.KYCDocumentListView.as_view(), name='document_list'),
    path('documents/upload/', views.KYCDocumentUploadView.as_view(), name='document_upload'),
    path('documents/<uuid:pk>/', views.KYCDocumentDetailView.as_view(), name='document_detail'),
    
    # History
    path('history/', views.KYCHistoryListView.as_view(), name='history_list'),
    
    # Admin endpoints
    path('admin/profiles/', views.KYCProfileListView.as_view(), name='admin_profile_list'),
    path('admin/profiles/<uuid:id>/', views.KYCProfileAdminDetailView.as_view(), name='admin_profile_detail'),
    path('admin/profiles/<uuid:id>/status/', views.KYCStatusUpdateView.as_view(), name='admin_status_update'),
    path('admin/documents/<uuid:pk>/verify/', views.KYCDocumentVerifyView.as_view(), name='admin_document_verify'),
    path('admin/stats/', views.kyc_summary_stats, name='admin_stats'),
    path('admin/config/', views.KYCConfigurationView.as_view(), name='admin_config'),
]
