# Wallet, KYC, and Bot API Usage Examples

This document shows how to use the wallet transfer, piggy bank, KYC verification, and bot API functionality through the REST API.

## Authentication System

This project uses **Django Session Authentication** for regular user endpoints and **API Key Authentication** for bot endpoints:

### Session Authentication (User Endpoints)
1. You need to login first to get a session cookie
2. The session cookie is automatically included in subsequent requests
3. No need for Authorization headers with tokens

### API Key Authentication (Bot Endpoints)
1. Create an API key using the management command
2. Include the API key in the `Authorization` header as `Api-Key YOUR_KEY`
3. Bot endpoints are at `/bot-api/` and bypass CSRF protection

## Prerequisites

1. Start the Django development server:
   ```bash
   cd backend
   source .venv/bin/activate
   python manage.py runserver
   ```

2. Create user accounts and login to get session cookies.

3. For bot API access, create an API key:
   ```bash
   python manage.py create_bot_api_key --name "My Bot Key"
   # Returns: API Key created: abcd1234-your-api-key-here
   ```

## Bot API Usage (For Automated Systems)

The bot API allows automated systems to query user information using API key authentication.

### Create API Key

```bash
cd backend
source .venv/bin/activate
python manage.py create_bot_api_key --name "Trading Bot"
# Output: API Key created: abcd1234-5678-90ef-ghij-klmnopqrstuv
```

### List Existing API Keys

```bash
python manage.py list_bot_api_keys
```

### Bot API Endpoints

All bot endpoints require the `Api-Key` header and are prefixed with `/bot-api/`:

```bash
# Get user information
curl -X GET http://localhost:8000/bot-api/users/alice/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"

# Response: {
#   "id": "user-uuid",
#   "username": "alice",
#   "email": "alice@example.com",
#   "date_joined": "2024-01-01T00:00:00Z",
#   "is_active": true
# }

# Get user's wallet information
curl -X GET http://localhost:8000/bot-api/users/alice/wallet/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"

# Response: {
#   "id": "wallet-uuid",
#   "name": "Alice Main Wallet",
#   "balance": "450.00",
#   "created_at": "2024-01-01T00:00:00Z"
# }

# Get user's transaction history
curl -X GET http://localhost:8000/bot-api/users/alice/transactions/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"

# Response: [
#   {
#     "id": "transaction-uuid",
#     "amount": "100.00",
#     "transaction_type": "TRANSFER_OUT",
#     "description": "Payment for dinner",
#     "created_at": "2024-01-01T12:00:00Z"
#   }
# ]

# Get user's piggy bank information
curl -X GET http://localhost:8000/bot-api/users/alice/piggybanks/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"

# Response: [
#   {
#     "id": "piggybank-uuid",
#     "name": "Restaurant Dinner Bill",
#     "current_amount": "300.00",
#     "target_amount": "300.00",
#     "is_target_reached": true
#   }
# ]
```

## KYC (Know Your Customer) Verification

The KYC system allows users to verify their identity by providing personal information and uploading documents.

### Create KYC Profile

```bash
# User must be logged in (using session cookie)
curl -X POST http://localhost:8000/api/kyc/profile/ \
  -H "Content-Type: application/json" \
  -b alice_cookies.txt \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "middle_name": "Marie",
    "date_of_birth": "1990-05-15",
    "nationality": "South African",
    "id_number": "9005150123084",
    "id_type": "NATIONAL_ID",
    "street_address": "123 Main Street",
    "city": "Cape Town",
    "province": "Western Cape",
    "postal_code": "8001",
    "country": "South Africa",
    "employment_status": "EMPLOYED",
    "employer_name": "Tech Corp",
    "job_title": "Software Developer",
    "monthly_income": "25000.00"
  }'

# Response: {
#   "id": "kyc-profile-uuid",
#   "kyc_status": "PENDING",
#   "verification_level": "BASIC",
#   "is_verified": false,
#   ...
# }
```

### Get KYC Profile Status

```bash
curl -X GET http://localhost:8000/api/kyc/profile/ \
  -b alice_cookies.txt

# Response: {
#   "id": "kyc-profile-uuid",
#   "kyc_status": "PENDING",
#   "verification_level": "BASIC",
#   "is_verified": false,
#   "full_name": "Alice Marie Johnson",
#   ...
# }
```

### Upload KYC Documents

```bash
# Upload ID document
curl -X POST http://localhost:8000/api/kyc/documents/ \
  -H "Content-Type: multipart/form-data" \
  -b alice_cookies.txt \
  -F "document_type=ID_DOCUMENT" \
  -F "document_file=@/path/to/id_document.jpg"

# Upload proof of address
curl -X POST http://localhost:8000/api/kyc/documents/ \
  -H "Content-Type: multipart/form-data" \
  -b alice_cookies.txt \
  -F "document_type=PROOF_OF_ADDRESS" \
  -F "document_file=@/path/to/utility_bill.pdf"

# Upload bank statement
curl -X POST http://localhost:8000/api/kyc/documents/ \
  -H "Content-Type: multipart/form-data" \
  -b alice_cookies.txt \
  -F "document_type=BANK_STATEMENT" \
  -F "document_file=@/path/to/bank_statement.pdf"
```

### Get Document Upload Status

```bash
curl -X GET http://localhost:8000/api/kyc/documents/ \
  -b alice_cookies.txt

# Response: [
#   {
#     "id": "document-uuid",
#     "document_type": "ID_DOCUMENT",
#     "status": "PENDING",
#     "file_size": 2048000,
#     "uploaded_at": "2024-01-01T10:00:00Z"
#   },
#   ...
# ]
```

### Get KYC Status Summary

```bash
curl -X GET http://localhost:8000/api/kyc/status/ \
  -b alice_cookies.txt

# Response: {
#   "kyc_profile": {
#     "kyc_status": "UNDER_REVIEW",
#     "verification_level": "BASIC",
#     "is_verified": false
#   },
#   "documents": {
#     "total_uploaded": 3,
#     "approved": 2,
#     "pending": 1,
#     "rejected": 0
#   },
#   "required_documents": [
#     "ID_DOCUMENT",
#     "PROOF_OF_ADDRESS",
#     "BANK_STATEMENT"
#   ],
#   "next_steps": "Please wait for document review to complete."
# }
```

### Get KYC History

```bash
curl -X GET http://localhost:8000/api/kyc/history/ \
  -b alice_cookies.txt

# Response: [
#   {
#     "action": "PROFILE_CREATED",
#     "description": "KYC profile created",
#     "timestamp": "2024-01-01T09:00:00Z",
#     "performed_by": "alice"
#   },
#   {
#     "action": "DOCUMENT_UPLOADED",
#     "description": "Document ID Document uploaded",
#     "timestamp": "2024-01-01T10:00:00Z",
#     "performed_by": "alice"
#   },
#   ...
# ]
```

### Admin KYC Management (Admin Users Only)

```bash
# Get all KYC profiles for review (admin only)
curl -X GET http://localhost:8000/api/kyc/admin/profiles/ \
  -b admin_cookies.txt

# Approve a KYC profile (admin only)
curl -X POST http://localhost:8000/api/kyc/admin/profiles/<kyc-profile-uuid>/approve/ \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"notes": "All documents verified successfully"}'

# Reject a KYC profile (admin only)
curl -X POST http://localhost:8000/api/kyc/admin/profiles/<kyc-profile-uuid>/reject/ \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "rejection_reason": "ID document is not clear enough",
    "notes": "Please resubmit with clearer image"
  }'

# Request profile update (admin only)
curl -X POST http://localhost:8000/api/kyc/admin/profiles/<kyc-profile-uuid>/request-update/ \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "notes": "Please update your address information"
  }'
```

## Authentication Steps

### Register Users

```bash
# Register Alice
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123"
  }'

# Register Bob
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123"
  }'
```

### Login and Save Session Cookies

```bash
# Login as Alice and save session cookie
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c alice_cookies.txt \
  -d '{
    "username": "alice",
    "password": "securepass123"
  }'

# Response: {
#   "id": "user-uuid",
#   "username": "alice",
#   "email": "alice@example.com",
#   "session_id": "abc123sessionkey456",
#   ...
# }
# Session cookie saved to alice_cookies.txt (contains sessionid)

# Login as Bob and save session cookie
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c bob_cookies.txt \
  -d '{
    "username": "bob",
    "password": "securepass123"
  }'

# Response: {
#   "id": "user-uuid",
#   "username": "bob",
#   "email": "bob@example.com",
#   "session_id": "def789sessionkey012",
#   ...
# }
# Session cookie saved to bob_cookies.txt (contains sessionid)
```

## Wallet Transfer Example

### Scenario: Two users transfer money between their wallets

**User 1 (Alice)**: Starts with R500, sends R100 to User 2  
**User 2 (Bob)**: Starts with R400, receives R100 from User 1  
**Final balances**: Alice R400, Bob R500

### Step 1: Create wallets for both users

```bash
# Alice creates her wallet (using Alice's session cookie)
curl -X POST http://localhost:8000/api/wallets/ \
  -H "Content-Type: application/json" \
  -b alice_cookies.txt \
  -d '{"name": "Alice Main Wallet"}'

# Response: {"id": "wallet-uuid-alice", "name": "Alice Main Wallet", "balance": "0.00", ...}

# Bob creates his wallet (using Bob's session cookie)
curl -X POST http://localhost:8000/api/wallets/ \
  -H "Content-Type: application/json" \
  -b bob_cookies.txt \
  -d '{"name": "Bob Main Wallet"}'

# Response: {"id": "wallet-uuid-bob", "name": "Bob Main Wallet", "balance": "0.00", ...}
```

### Step 2: Deposit money into wallets

```bash
# Alice deposits R500
curl -X POST http://localhost:8000/api/wallets/<wallet-uuid-alice>/deposit/ \
  -H "Content-Type: application/json" \
  -b alice_cookies.txt \
  -d '{"amount": "500.00", "description": "Initial deposit"}'

# Bob deposits R400
curl -X POST http://localhost:8000/api/wallets/<wallet-uuid-bob>/deposit/ \
  -H "Content-Type: application/json" \
  -b bob_cookies.txt \
  -d '{"amount": "400.00", "description": "Initial deposit"}'
```

### Step 3: Alice transfers R100 to Bob

```bash
curl -X POST http://localhost:8000/api/wallets/<wallet-uuid-alice>/transfer/ \
  -H "Content-Type: application/json" \
  -b alice_cookies.txt \
  -d '{
    "recipient_wallet_id": "<wallet-uuid-bob>",
    "amount": "100.00",
    "description": "Payment for dinner"
  }'
```

### Step 4: Check final balances

```bash
# Check Alice's wallet
curl -X GET http://localhost:8000/api/wallets/<wallet-uuid-alice>/ \
  -b alice_cookies.txt
# Response: {"balance": "400.00", ...}

# Check Bob's wallet
curl -X GET http://localhost:8000/api/wallets/<wallet-uuid-bob>/ \
  -b bob_cookies.txt
# Response: {"balance": "500.00", ...}
```

## Piggy Bank Example

### Scenario: Restaurant bill splitting

**Creator**: Creates piggy bank for R300 restaurant bill  
**3 Friends**: Each contribute different amounts  
**Restaurant**: Receives payment from piggy bank

### Step 1: Creator creates piggy bank

```bash
# First, login as creator and save session
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c creator_cookies.txt \
  -d '{"username": "creator", "password": "securepass123"}'

# Create piggy bank
curl -X POST http://localhost:8000/api/piggybanks/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{
    "name": "Restaurant Dinner Bill",
    "description": "Splitting dinner bill at fancy restaurant",
    "target_amount": "300.00"
  }'

# Response: {"id": "piggybank-uuid", "name": "Restaurant Dinner Bill", ...}
```

### Step 2: Add friends as members

```bash
# Add friend1
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/add-member/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{"username": "friend1"}'

# Add friend2
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/add-member/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{"username": "friend2"}'

# Add friend3
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/add-member/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{"username": "friend3"}'
```

### Step 3: Each user contributes to piggy bank

```bash
# First, each friend needs to login and save their session cookies
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c friend1_cookies.txt \
  -d '{"username": "friend1", "password": "securepass123"}'

curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c friend2_cookies.txt \
  -d '{"username": "friend2", "password": "securepass123"}'

curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -c friend3_cookies.txt \
  -d '{"username": "friend3", "password": "securepass123"}'

# Creator contributes R50 (from their wallet)
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/contribute/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{
    "wallet_id": "<creator-wallet-uuid>",
    "amount": "50.00"
  }'

# Friend1 contributes R100
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/contribute/ \
  -H "Content-Type: application/json" \
  -b friend1_cookies.txt \
  -d '{
    "wallet_id": "<friend1-wallet-uuid>",
    "amount": "100.00"
  }'

# Friend2 contributes R80
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/contribute/ \
  -H "Content-Type: application/json" \
  -b friend2_cookies.txt \
  -d '{
    "wallet_id": "<friend2-wallet-uuid>",
    "amount": "80.00"
  }'

# Friend3 contributes R70
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/contribute/ \
  -H "Content-Type: application/json" \
  -b friend3_cookies.txt \
  -d '{
    "wallet_id": "<friend3-wallet-uuid>",
    "amount": "70.00"
  }'
```

### Step 4: Check piggy bank status

```bash
curl -X GET http://localhost:8000/api/piggybanks/<piggybank-uuid>/ \
  -b creator_cookies.txt

# Response: {
#   "current_amount": "300.00",
#   "target_amount": "300.00",
#   "progress_percentage": 100.0,
#   "is_target_reached": true,
#   ...
# }
```

### Step 5: Pay restaurant bill from piggy bank

```bash
curl -X POST http://localhost:8000/api/piggybanks/<piggybank-uuid>/pay/ \
  -H "Content-Type: application/json" \
  -b creator_cookies.txt \
  -d '{
    "recipient_wallet_id": "<restaurant-wallet-uuid>",
    "amount": "300.00",
    "description": "Restaurant dinner bill payment"
  }'
```

### Step 6: View contributions

```bash
curl -X GET http://localhost:8000/api/piggybanks/<piggybank-uuid>/contributions/ \
  -b creator_cookies.txt

# Shows all contributions made to the piggy bank
```

## API Endpoints Summary

### Authentication Endpoints
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user

### Wallet Endpoints
- `POST /api/wallets/` - Create wallet
- `GET /api/wallets/<id>/` - Get wallet details
- `POST /api/wallets/<id>/deposit/` - Deposit money
- `POST /api/wallets/<id>/transfer/` - Transfer to another wallet
- `GET /api/wallets/<id>/transactions/` - Get transaction history

### Piggy Bank Endpoints
- `POST /api/piggybanks/` - Create piggy bank
- `GET /api/piggybanks/<id>/` - Get piggy bank details
- `POST /api/piggybanks/<id>/add-member/` - Add member
- `POST /api/piggybanks/<id>/contribute/` - Contribute money
- `POST /api/piggybanks/<id>/pay/` - Pay from piggy bank funds
- `GET /api/piggybanks/<id>/contributions/` - View contributions
- `GET /api/piggybanks/<id>/members/` - View members

### KYC Endpoints
- `POST /api/kyc/profile/` - Create/Update KYC profile
- `GET /api/kyc/profile/` - Get user's KYC profile
- `POST /api/kyc/documents/` - Upload KYC document
- `GET /api/kyc/documents/` - Get user's uploaded documents
- `GET /api/kyc/status/` - Get KYC verification status
- `GET /api/kyc/history/` - Get KYC verification history

### KYC Admin Endpoints (Admin Only)
- `GET /api/kyc/admin/profiles/` - Get all KYC profiles for review
- `POST /api/kyc/admin/profiles/<id>/approve/` - Approve KYC profile
- `POST /api/kyc/admin/profiles/<id>/reject/` - Reject KYC profile
- `POST /api/kyc/admin/profiles/<id>/request-update/` - Request profile update
- `GET /api/kyc/admin/documents/` - Get all documents for review
- `POST /api/kyc/admin/documents/<id>/approve/` - Approve document
- `POST /api/kyc/admin/documents/<id>/reject/` - Reject document

### Bot API Endpoints (API Key Required)
- `GET /bot-api/users/<username>/` - Get user information
- `GET /bot-api/users/<username>/wallet/` - Get user's wallet info
- `GET /bot-api/users/<username>/transactions/` - Get user's transactions
- `GET /bot-api/users/<username>/piggybanks/` - Get user's piggy banks

## Testing with Two App Instances

To test transfers between users running different app instances:

1. Start the Django server: `python manage.py runserver`
2. Create two user accounts
3. Use different authentication tokens for each user
4. Follow the wallet transfer example above
5. The transfers will work across different client instances as long as they connect to the same backend server

The backend handles all the transaction logic, so transfers between users work regardless of which app instance they're using.

## KYC Verification Levels and Requirements

### Verification Levels
- **BASIC**: Personal information and ID document
- **ENHANCED**: Basic + proof of address
- **PREMIUM**: Enhanced + bank statement and employment verification

### KYC Status Values
- **PENDING**: Initial state after profile creation
- **UNDER_REVIEW**: Documents submitted, awaiting admin review
- **APPROVED**: KYC verification completed successfully
- **REJECTED**: KYC verification failed, see rejection_reason
- **REQUIRES_UPDATE**: Additional information needed

### Document Types
- **ID_DOCUMENT**: National ID, passport, or driver's license
- **PROOF_OF_ADDRESS**: Utility bill, bank statement with address
- **BANK_STATEMENT**: Recent bank statement (last 3 months)
- **EMPLOYMENT_LETTER**: Letter from employer confirming employment
- **PAYSLIP**: Recent payslip for income verification
- **OTHER**: Other supporting documents as requested

### Supported File Types
- Images: JPG, JPEG, PNG
- Documents: PDF
- Maximum file size: 5MB per document

## Django Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` to:

- Review and approve/reject KYC profiles
- Manage KYC documents
- View KYC verification history
- Configure KYC settings
- Manage API keys for bot access

Create a superuser account:
```bash
python manage.py createsuperuser
```
