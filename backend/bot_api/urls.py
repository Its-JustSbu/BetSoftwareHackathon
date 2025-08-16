from django.urls import path
from . import views

app_name = 'bot_api'

urlpatterns = [
    # API status and health check
    path('status/', views.api_status, name='api_status'),
    
    # User-related endpoints
    path('users/search/', views.search_user, name='search_user'),
    path('users/summary/', views.get_all_users_summary, name='get_all_users_summary'),
    path('users/<uuid:user_id>/', views.get_user_by_id, name='get_user_by_id'),
    path('users/<uuid:user_id>/wallets/', views.get_user_wallets, name='get_user_wallets'),
    path('users/<uuid:user_id>/transactions/', views.get_user_transactions, name='get_user_transactions'),
    path('users/<uuid:user_id>/piggybanks/', views.get_user_piggybanks, name='get_user_piggybanks'),
    
    # Wallet-related endpoints
    path('wallets/search/', views.search_wallets, name='search_wallets'),
    path('wallets/<uuid:wallet_id>/', views.get_wallet_by_id, name='get_wallet_by_id'),
    path('wallets/<uuid:wallet_id>/transactions/', views.get_wallet_transactions, name='get_wallet_transactions'),
    
    # Piggy bank endpoints
    path('piggybanks/<uuid:piggybank_id>/', views.get_piggybank_by_id, name='get_piggybank_by_id'),
    
    # System statistics
    path('stats/', views.get_system_stats, name='get_system_stats'),
]
