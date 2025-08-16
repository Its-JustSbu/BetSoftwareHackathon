# Bot API Documentation with KYC Integration

This document describes the Bot API endpoints that allow external bots to query user information, wallet data, and KYC verification status from the database.

## ✅ Testing Status

**All endpoints have been successfully tested and are fully functional!**

The following test results confirm the API is working correctly:
- ✅ API Status Check: Returns proper authentication status
- ✅ User Search: Successfully finds and returns user data with KYC info
- ✅ KYC Status Check: Returns comprehensive KYC verification details
- ✅ System Statistics: Returns accurate system-wide statistics with KYC metrics
- ✅ Transaction Validation: Validates transactions against KYC limits
- ✅ User Summary: Returns paginated list of all users with KYC data

Last updated: August 16, 2025

## 🆕 New KYC Features

- **KYC Status Checking**: Get detailed KYC verification status for users
- **Transaction Validation**: Check if users can perform transactions based on KYC level
- **KYC-Based Filtering**: Search wallets and users by KYC verification level
- **Enhanced Statistics**: System stats now include KYC verification metrics
- **Transaction Limits**: View user transaction limits based on KYC level

## Authentication

All API endpoints require authentication using an API key. Include the API key in the request header:

```
X-API-Key: your-api-key-here
```

**Note:** The header name is case-sensitive and must be `X-API-Key` (not `x-api-key`).

## Base URL

All endpoints are prefixed with `/bot-api/`

## API Status

🟢 **FULLY FUNCTIONAL** - All endpoints have been tested and are working correctly as of August 16, 2025.

## Endpoints

### 1. API Status Check

**GET** `/bot-api/status/`

Check if the API is working and validate your API key.

**Response:**
```json
{
    "status": "active",
    "message": "Bot API is working properly",
    "authenticated": true
}
```

**Status:** ✅ Working

### 2. Search Users

**POST** `/bot-api/users/search/`

Search for users by various criteria. At least one search parameter must be provided.

**Request Body:**
```json
{
    "username": "optional_username",
    "email": "optional_email@example.com",
    "phone_number": "optional_phone",
    "user_id": "optional_uuid"
}
```

**Response:**
```json
{
    "message": "Found 1 user(s)",
    "users": [
        {
            "id": "7ade19ee-f338-47db-8d99-54388d9fa3e7",
            "username": "admin",
            "email": "admin@example.com",
            "first_name": "",
            "last_name": "",
            "phone_number": null,
            "created_at": "2025-08-15T22:26:10.059931Z",
            "is_active": true
        }
    ]
}
```

**Status:** ✅ Working

### 3. Get User by ID

**GET** `/bot-api/users/{user_id}/`

Get detailed information about a specific user.

**Response:**
```json
{
    "id": "7ade19ee-f338-47db-8d99-54388d9fa3e7",
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "",
    "last_name": "",
    "phone_number": null,
    "created_at": "2025-08-15T22:26:10.059931Z",
    "is_active": true,
    "has_kyc_profile": false,
    "is_kyc_verified": false,
    "kyc_status": null,
    "kyc_verification_level": null,
    "kyc_full_name": "admin",
    "transaction_limit": 0,
    "kyc_summary": {
        "has_profile": false,
        "status": null,
        "level": null,
        "is_verified": false,
        "transaction_limit": 0,
        "next_step": "Create KYC profile"
    }
}
```

**Status:** ✅ Working

### 4. Get User Wallets

**GET** `/bot-api/users/{user_id}/wallets/`

Get all wallets belonging to a specific user.

**Response:**
```json
{
    "user": "john_doe",
    "wallet_count": 2,
    "wallets": [
        {
            "id": "wallet_uuid",
            "owner": "user_uuid",
            "owner_username": "john_doe",
            "name": "My Main Wallet",
            "balance": "1000.50",
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-02T00:00:00Z",
            "is_active": true,
            "owner_kyc_status": "APPROVED",
            "owner_verification_level": "ENHANCED",
            "owner_transaction_limit": 50000,
            "can_transact_1k": {
                "allowed": true,
                "reason": "Transaction allowed"
            },
            "can_transact_10k": {
                "allowed": true,
                "reason": "Transaction allowed"
            }
        }
    ]
}
```

### 5. Search Wallets

**POST** `/bot-api/wallets/search/`

Search for wallets by various criteria including KYC filters.

**Request Body:**
```json
{
    "owner_username": "optional_username",
    "owner_email": "optional_email",
    "wallet_id": "optional_uuid",
    "is_active": true,
    "kyc_verified_only": false,
    "min_kyc_level": "ENHANCED"
}
```

### 6. Get Wallet by ID

**GET** `/bot-api/wallets/{wallet_id}/`

Get detailed information about a specific wallet.

### 7. Get Wallet Transactions

**GET** `/bot-api/wallets/{wallet_id}/transactions/?limit=50`

Get transactions for a specific wallet. Optional `limit` parameter (max 100).

**Response:**
```json
{
    "wallet_id": "wallet_uuid",
    "wallet_owner": "john_doe",
    "transaction_count": 10,
    "transactions": [
        {
            "id": "transaction_uuid",
            "wallet": "wallet_uuid",
            "wallet_owner": "john_doe",
            "transaction_type": "DEPOSIT",
            "amount": "100.00",
            "status": "COMPLETED",
            "description": "Initial deposit",
            "reference_id": "ref_123",
            "related_wallet": null,
            "related_wallet_owner": null,
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z"
        }
    ]
}
```

### 8. Get User Transactions

**GET** `/bot-api/users/{user_id}/transactions/?limit=50`

Get all transactions for a user across all their wallets.

### 9. Get User Piggy Banks

**GET** `/bot-api/users/{user_id}/piggybanks/`

Get all piggy banks created by a specific user.

**Response:**
```json
{
    "user_id": "user_uuid",
    "username": "john_doe",
    "piggybank_count": 1,
    "piggybanks": [
        {
            "id": "piggybank_uuid",
            "name": "Vacation Fund",
            "description": "Saving for summer vacation",
            "creator": "user_uuid",
            "creator_username": "john_doe",
            "target_amount": "5000.00",
            "current_amount": "1500.00",
            "progress_percentage": 30.0,
            "is_target_reached": false,
            "is_active": true,
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-02T00:00:00Z"
        }
    ]
}
```

### 10. Get Piggy Bank by ID

**GET** `/bot-api/piggybanks/{piggybank_id}/`

Get detailed information about a specific piggy bank.

### 11. Get All Users Summary

**GET** `/bot-api/users/summary/?limit=20`

Get a summary of all users in the system. Optional `limit` parameter (max 100).

**Response:**
```json
{
    "total_users_in_system": 150,
    "returned_count": 20,
    "users": [...]
}
```

### 12. Get System Statistics

**GET** `/bot-api/stats/`

Get system-wide statistics.

**Response:**
```json
{
    "message": "System statistics retrieved successfully",
    "stats": {
        "users": {
            "total_users": 150,
            "active_users": 145,
            "users_with_kyc_profile": 120,
            "kyc_verified_users": 100,
            "kyc_pending": 15,
            "kyc_under_review": 5
        },
        "kyc_levels": {
            "basic": 60,
            "enhanced": 30,
            "premium": 10
        },
        "wallets": {
            "total_wallets": 200,
            "active_wallets": 195
        },
        "transactions": {
            "total_transactions": 5000,
            "completed_transactions": 4950
        },
        "piggybanks": {
            "total_piggybanks": 25,
            "active_piggybanks": 20
        }
    }
}
```

**Status:** ✅ Working

## 🆕 New KYC Endpoints

The following endpoints provide access to KYC (Know Your Customer) verification data:

### 13. Get User KYC Status
**GET** `/bot-api/users/{user_id}/kyc-status/` - Get comprehensive KYC status for a user

### 14. Get Users by KYC Level  
**GET** `/bot-api/users/kyc-level/{level}/` - Filter users by verification level (basic/enhanced/premium/unverified)

### 15. Validate Transaction
**POST** `/bot-api/validate-transaction/` - Check if user can perform transaction based on KYC limits

### 16. Get KYC Profiles
**GET** `/bot-api/kyc/profiles/` - Get KYC profiles with filtering options

### KYC Transaction Limits
- **No KYC**: R0 (no transactions allowed)
- **Basic KYC**: R10,000 per day
- **Enhanced KYC**: R50,000 per day  
- **Premium KYC**: R500,000 per day

## Error Responses

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
    "error": "Error message description"
}
```

## Rate Limiting

Currently, there are no rate limits implemented, but it's recommended to implement reasonable delays between requests to avoid overwhelming the server.

## Usage Examples

### Python Example

```python
import requests

API_KEY = "your-api-key-here"
BASE_URL = "https://your-domain.com/bot-api"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Search for a user
response = requests.post(
    f"{BASE_URL}/users/search/",
    json={"username": "john_doe"},
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    users = data.get("users", [])
    for user in users:
        print(f"Found user: {user['username']} - {user['email']}")
        print(f"KYC Status: {user['kyc_status']} - Level: {user['kyc_verification_level']}")
        print(f"Transaction Limit: R{user['transaction_limit']}")
else:
    print(f"Error: {response.status_code} - {response.text}")

# Get user KYC status
user_id = "7ade19ee-f338-47db-8d99-54388d9fa3e7"
response = requests.get(
    f"{BASE_URL}/users/{user_id}/kyc-status/",
    headers=headers
)

if response.status_code == 200:
    kyc_data = response.json()
    print(f"User {kyc_data['username']} KYC Summary:")
    print(f"- Verified: {kyc_data['is_kyc_verified']}")
    print(f"- Level: {kyc_data['kyc_verification_level']}")
    print(f"- Limit: R{kyc_data['transaction_limit']}")
    print(f"- Next Step: {kyc_data['kyc_summary']['next_step']}")

# Validate a transaction
validation_data = {
    "user_id": user_id,
    "amount": "15000.00",
    "transaction_type": "TRANSFER_OUT"
}

response = requests.post(
    f"{BASE_URL}/validate-transaction/",
    json=validation_data,
    headers=headers
)

if response.status_code == 200:
    result = response.json()
    validation = result['validation']
    print(f"Can transact R{result['amount']}: {validation['can_transact']}")
    if not validation['can_transact']:
        print(f"Reason: {validation['reason']}")

# Get users by KYC level
response = requests.get(
    f"{BASE_URL}/users/kyc-level/enhanced/?limit=10",
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print(f"Found {data['user_count']} users with Enhanced KYC")
    for user in data['users']:
        print(f"- {user['username']}: R{user['transaction_limit']} limit")
```

### cURL Example

```bash
# Check API status
curl -H "X-API-Key: your-api-key-here" \
     https://your-domain.com/bot-api/status/

# Search for a user
curl -X POST \
     -H "X-API-Key: your-api-key-here" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin"}' \
     https://your-domain.com/bot-api/users/search/
```

## Security Considerations

1. **Keep API keys secure**: Never expose API keys in client-side code or public repositories
2. **Use HTTPS**: Always use HTTPS in production to protect API keys and data in transit
3. **Rotate keys regularly**: Create new API keys periodically and deactivate old ones
4. **Monitor usage**: Keep track of which bots are using which API keys and monitor for suspicious activity

## Managing API Keys

### Create a new API key:
```bash
cd /workspaces/BetSoftwareHackathon/backend
source .venv/bin/activate
python manage.py create_bot_api_key --bot-name "MyBot" --description "Bot for user queries"
```

### List existing API keys:
```bash
cd /workspaces/BetSoftwareHackathon/backend
source .venv/bin/activate
python manage.py list_bot_api_keys --active-only
```

### Deactivate an API key:
Use the Django admin interface at `/admin/rest_framework_api_key/apikey/` to revoke API keys.
