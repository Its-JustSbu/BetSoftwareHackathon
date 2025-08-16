#!/usr/bin/env python
"""
Test script for Bot API endpoints
"""
import requests
import json

# Configuration
API_KEY = "OXLLaTMb.onyzBT4RuBsYUJ4Y94viyahObp3Ihm0B"
BASE_URL = "http://localhost:8000/bot-api"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def test_endpoint(method, endpoint, data=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'='*60}")
    print(f"Testing: {method} {url}")
    print(f"{'='*60}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response JSON:")
            print(json.dumps(response_data, indent=2))
        except:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Testing Bot API Endpoints")
    print("=" * 60)
    
    # Test 1: API Status
    test_endpoint("GET", "/status/")
    
    # Test 2: Search for a user
    test_endpoint("POST", "/users/search/", {"username": "admin"})
    
    # Test 3: Get system stats
    test_endpoint("GET", "/stats/")
    
    # Test 4: Get all users summary
    test_endpoint("GET", "/users/summary/")
    
    # Test 5: Get user by ID
    test_endpoint("GET", "/users/7ade19ee-f338-47db-8d99-54388d9fa3e7/")
    
    # Test 6: Get user wallets
    test_endpoint("GET", "/users/7ade19ee-f338-47db-8d99-54388d9fa3e7/wallets/")
    
    # Test 7: Search wallets
    test_endpoint("POST", "/wallets/search/", {"owner_username": "admin"})
    
    print(f"\n{'='*60}")
    print("Testing completed!")
    print(f"{'='*60}")
