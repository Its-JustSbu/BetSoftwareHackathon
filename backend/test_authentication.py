#!/usr/bin/env python
"""
Test script to demonstrate authentication flow.
Run with: python manage.py shell < test_authentication.py
"""

import os
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def test_authentication_flow():
    """Test the authentication flow with actual HTTP requests."""
    
    # Clean up any existing test users
    User.objects.filter(username__in=['testuser1', 'testuser2']).delete()
    
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("AUTHENTICATION FLOW TEST")
    print("=" * 60)
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    print("1. Registering a new user...")
    
    # Register user
    register_data = {
        "username": "testuser1",
        "email": "testuser1@example.com", 
        "password": "securepass123",
        "password_confirm": "securepass123"
    }
    
    response = session.post(f"{base_url}/api/auth/register/", json=register_data)
    print(f"   Registration status: {response.status_code}")
    if response.status_code == 201:
        print(f"   User created: {response.json()['username']}")
    else:
        print(f"   Registration failed: {response.text}")
        return
    
    print("\n2. Logging in...")
    
    # Login
    login_data = {
        "username": "testuser1",
        "password": "securepass123"
    }
    
    response = session.post(f"{base_url}/api/auth/login/", json=login_data)
    print(f"   Login status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Logged in as: {response.json()['username']}")
        print(f"   Session cookies: {list(session.cookies.keys())}")
    else:
        print(f"   Login failed: {response.text}")
        return
    
    print("\n3. Creating a wallet (authenticated request)...")
    
    # Create wallet - this should work because we're authenticated
    wallet_data = {"name": "Test Wallet"}
    response = session.post(f"{base_url}/api/wallets/", json=wallet_data)
    print(f"   Wallet creation status: {response.status_code}")
    if response.status_code == 201:
        wallet_id = response.json()['id']
        print(f"   Wallet created with ID: {wallet_id}")
        print(f"   Wallet balance: R{response.json()['balance']}")
    else:
        print(f"   Wallet creation failed: {response.text}")
        return
    
    print("\n4. Depositing money...")
    
    # Deposit money
    deposit_data = {"amount": "100.00", "description": "Test deposit"}
    response = session.post(f"{base_url}/api/wallets/{wallet_id}/deposit/", json=deposit_data)
    print(f"   Deposit status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Deposited: R{response.json()['amount']}")
    else:
        print(f"   Deposit failed: {response.text}")
        return
    
    print("\n5. Checking wallet balance...")
    
    # Get wallet details
    response = session.get(f"{base_url}/api/wallets/{wallet_id}/")
    print(f"   Get wallet status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Current balance: R{response.json()['balance']}")
    else:
        print(f"   Get wallet failed: {response.text}")
    
    print("\n6. Testing unauthenticated request...")
    
    # Create new session without authentication
    unauth_session = requests.Session()
    response = unauth_session.get(f"{base_url}/api/wallets/{wallet_id}/")
    print(f"   Unauthenticated request status: {response.status_code}")
    if response.status_code == 403:
        print("   ✓ Correctly blocked unauthenticated request")
    else:
        print(f"   ✗ Unexpected response: {response.text}")
    
    print("\n7. Logging out...")
    
    # Logout
    response = session.post(f"{base_url}/api/auth/logout/")
    print(f"   Logout status: {response.status_code}")
    if response.status_code == 200:
        print("   ✓ Successfully logged out")
    else:
        print(f"   Logout failed: {response.text}")
    
    print("\n8. Testing request after logout...")
    
    # Try to access wallet after logout
    response = session.get(f"{base_url}/api/wallets/{wallet_id}/")
    print(f"   Post-logout request status: {response.status_code}")
    if response.status_code == 403:
        print("   ✓ Correctly blocked request after logout")
    else:
        print(f"   ✗ Unexpected response: {response.text}")
    
    print("\n" + "=" * 60)
    print("AUTHENTICATION TEST COMPLETED")
    print("=" * 60)
    print("\nKey Points:")
    print("- No tokens needed - uses Django session cookies")
    print("- Session cookies are automatically managed by requests.Session()")
    print("- Authentication persists across requests until logout")
    print("- Unauthenticated requests are properly blocked")

if __name__ == "__main__":
    print("Starting authentication test...")
    print("Make sure the Django server is running on localhost:8000")
    print("Run: python manage.py runserver")
    print()
    
    try:
        test_authentication_flow()
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to Django server.")
        print("Please start the server with: python manage.py runserver")
    except Exception as e:
        print(f"ERROR: {e}")
