from django.urls import path
from . import views

urlpatterns = [
    # Wallet endpoints
    path('wallets/', views.WalletListCreateView.as_view(), name='wallet-list-create'),
    path('wallets/<uuid:pk>/', views.WalletDetailView.as_view(), name='wallet-detail'),
    path('wallets/<uuid:wallet_id>/deposit/', views.deposit_money, name='wallet-deposit'),
    path('wallets/<uuid:wallet_id>/transfer/', views.transfer_money, name='wallet-transfer'),
    path('wallets/<uuid:wallet_id>/transactions/', views.WalletTransactionListView.as_view(), name='wallet-transactions'),
    
    # PiggyBank endpoints
    path('piggybanks/', views.PiggyBankListCreateView.as_view(), name='piggybank-list-create'),
    path('piggybanks/<uuid:pk>/', views.PiggyBankDetailView.as_view(), name='piggybank-detail'),
    path('piggybanks/<uuid:piggybank_id>/members/', views.PiggyBankMemberListView.as_view(), name='piggybank-members'),
    path('piggybanks/<uuid:piggybank_id>/add-member/', views.add_piggybank_member, name='piggybank-add-member'),
    path('piggybanks/<uuid:piggybank_id>/contribute/', views.contribute_to_piggybank, name='piggybank-contribute'),
    path('piggybanks/<uuid:piggybank_id>/contributions/', views.PiggyBankContributionListView.as_view(), name='piggybank-contributions'),
    path('piggybanks/<uuid:piggybank_id>/pay/', views.pay_from_piggybank, name='piggybank-pay'),
]
