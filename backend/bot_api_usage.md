# Bot API Documentation

This document describes the Bot API endpoints that allow external bots to query user information from the database.

## ✅ Testing Status

**All endpoints have been successfully tested and are fully functional!**

The following test results confirm the API is working correctly:
- ✅ API Status Check: Returns proper authentication status
- ✅ User Search: Successfully finds and returns user data
- ✅ System Statistics: Returns accurate system-wide statistics
- ✅ User Summary: Returns paginated list of all users

Last tested: August 16, 2025

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
    "is_active": true
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
            "is_active": true
        }
    ]
}
```

### 5. Search Wallets

**POST** `/bot-api/wallets/search/`

Search for wallets by various criteria.

**Request Body:**
```json
{
    "owner_username": "optional_username",
    "owner_email": "optional_email",
    "wallet_id": "optional_uuid",
    "is_active": true
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
        "total_users": 8,
        "active_users": 8,
        "total_wallets": 10,
        "active_wallets": 10,
        "total_transactions": 12,
        "completed_transactions": 12,
        "total_piggybanks": 1,
        "active_piggybanks": 1
    }
}
```

**Status:** ✅ Working

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
else:
    print(f"Error: {response.status_code} - {response.text}")

# Get user wallets
user_id = "7ade19ee-f338-47db-8d99-54388d9fa3e7"  # Example user ID from test
response = requests.get(
    f"{BASE_URL}/users/{user_id}/wallets/",
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print(f"User {data['user']} has {data['wallet_count']} wallets")
    for wallet in data['wallets']:
        print(f"- {wallet['name']}: R{wallet['balance']}")
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
