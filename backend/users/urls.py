from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]
