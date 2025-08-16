# Wallet API with KYC & Bot Integration - MVP

A comprehensive Django REST Framework API for wallet management, peer-to-peer transfers, bill splitting, KYC verification, and bot integration for automated systems.

## Features

### 1. User Management
- User registration and authentication
- Custom user model with UUID primary keys
- Session-based authentication
- KYC-aware user profiles with transaction limits
- User verification status tracking

### 2. Wallet Management
- Create multiple wallets per user
- Deposit money into wallets with KYC validation
- View wallet balance and transaction history
- KYC-based transaction limits enforcement
- Soft delete wallets (mark as inactive)

### 3. Peer-to-Peer Transfers
- Send money between users using wallet IDs
- Automatic balance and KYC validation
- Transaction limits based on verification level
- Transaction recording for both sender and recipient
- Linked transaction records for audit trail

### 4. Piggy Bank (Bill Splitting)
- Create shared piggy banks with target amounts
- Invite other users to contribute
- Track contributions from multiple users
- KYC validation for large contributions
- Progress tracking towards target amount
- Member management

### 5. KYC (Know Your Customer) Verification
- Complete user identity verification system
- Document upload and validation
- Multi-level verification (Basic, Enhanced, Premium)
- Admin review and approval workflow
- Verification history tracking
- Transaction limit enforcement based on KYC level

### 6. Bot API Integration
- API key-based authentication for automated systems
- Query user information, wallets, and transactions
- Secure bot access with CSRF exemption
- Management commands for API key administration

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET/PUT /api/auth/profile/` - Get/Update user profile

### Wallets
- `GET/POST /api/wallets/` - List/Create wallets
- `GET/PUT/DELETE /api/wallets/{id}/` - Wallet details
- `POST /api/wallets/{id}/deposit/` - Deposit money (KYC validated)
- `POST /api/wallets/{id}/transfer/` - Transfer to another wallet (KYC validated)
- `GET /api/wallets/{id}/transactions/` - Wallet transaction history

### Piggy Banks
- `GET/POST /api/piggybanks/` - List/Create piggy banks
- `GET/PUT/DELETE /api/piggybanks/{id}/` - Piggy bank details
- `POST /api/piggybanks/{id}/add-member/` - Add member
- `POST /api/piggybanks/{id}/contribute/` - Contribute money (KYC validated)
- `GET /api/piggybanks/{id}/contributions/` - List contributions
- `GET /api/piggybanks/{id}/members/` - List members

### KYC Endpoints
- `POST /api/kyc/profile/` - Create/Update KYC profile
- `GET /api/kyc/profile/` - Get user's KYC profile
- `POST /api/kyc/documents/` - Upload KYC document
- `GET /api/kyc/documents/` - Get user's uploaded documents
- `GET /api/kyc/status/` - Get KYC verification status
- `GET /api/kyc/history/` - Get KYC verification history

### KYC Admin Endpoints (Admin Only)
- `GET /api/kyc/admin/profiles/` - Get all KYC profiles for review
- `POST /api/kyc/admin/profiles/{id}/approve/` - Approve KYC profile
- `POST /api/kyc/admin/profiles/{id}/reject/` - Reject KYC profile
- `POST /api/kyc/admin/profiles/{id}/request-update/` - Request profile update
- `GET /api/kyc/admin/documents/` - Get all documents for review
- `POST /api/kyc/admin/documents/{id}/approve/` - Approve document
- `POST /api/kyc/admin/documents/{id}/reject/` - Reject document

### Bot API Endpoints (API Key Required)
- `GET /bot-api/users/{username}/` - Get user information
- `GET /bot-api/users/{username}/wallet/` - Get user's wallet info
- `GET /bot-api/users/{username}/transactions/` - Get user's transactions
- `GET /bot-api/users/{username}/piggybanks/` - Get user's piggy banks

## Documentation

- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/
- **OpenAPI Schema**: http://127.0.0.1:8000/api/schema/

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   # Or install individually:
   # pip install djangorestframework drf-spectacular djangorestframework-api-key
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

4. **Create Bot API Key** (Optional):
   ```bash
   python manage.py create_bot_api_key --name "My Bot Key"
   # Note the generated API key for bot access
   ```

5. **Start Development Server**:
   ```bash
   python manage.py runserver
   ```

6. **Run Tests**:
   ```bash
   python manage.py test
   ```

## Usage Examples

### 1. Register a User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123"
  }'
```

### 2. Create KYC Profile (Required for transactions > R1000)
```bash
curl -X POST http://127.0.0.1:8000/api/kyc/profile/ \
  -H "Content-Type: application/json" \
  -b session_cookies.txt \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "nationality": "South African",
    "id_number": "9005150123084",
    "id_type": "SA_ID",
    "street_address": "123 Main Street",
    "city": "Cape Town",
    "province": "Western Cape",
    "postal_code": "8001",
    "country": "South Africa",
    "employment_status": "EMPLOYED"
  }'
```

### 3. Upload KYC Documents
```bash
# Upload ID document
curl -X POST http://127.0.0.1:8000/api/kyc/documents/ \
  -H "Content-Type: multipart/form-data" \
  -b session_cookies.txt \
  -F "document_type=ID_DOCUMENT" \
  -F "document_file=@/path/to/id_document.jpg"
```

### 4. Create a Wallet
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/ \
  -H "Content-Type: application/json" \
  -b session_cookies.txt \
  -d '{"name": "My Main Wallet"}'
```

### 5. Deposit Money (with KYC validation)
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/{wallet_id}/deposit/ \
  -H "Content-Type: application/json" \
  -b session_cookies.txt \
  -d '{
    "amount": "100.00",
    "description": "Initial deposit"
  }'
```

### 6. Transfer Money (with KYC limits)
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/{wallet_id}/transfer/ \
  -H "Content-Type: application/json" \
  -b session_cookies.txt \
  -d '{
    "recipient_wallet_id": "recipient-wallet-uuid",
    "amount": "50.00",
    "description": "Payment for dinner"
  }'
```

### 7. Bot API Usage
```bash
# Get user info using bot API key
curl -X GET http://127.0.0.1:8000/bot-api/users/john_doe/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"

# Get user's wallet info
curl -X GET http://127.0.0.1:8000/bot-api/users/john_doe/wallet/ \
  -H "Authorization: Api-Key YOUR_API_KEY_HERE"
```

### 8. Create a Piggy Bank
```bash
curl -X POST http://127.0.0.1:8000/api/piggybanks/ \
  -H "Content-Type: application/json" \
  -b session_cookies.txt \
  -d '{
    "name": "Vacation Fund",
    "description": "Saving for our group vacation",
    "target_amount": "2000.00"
  }'
```

## Models

### User
- Custom user model extending AbstractUser
- UUID primary key
- Email and phone number fields
- KYC-aware properties and methods
- Transaction limit calculation based on KYC level

### Wallet
- Belongs to a user
- Has a balance (decimal field)
- KYC validation for transactions
- Transaction limit enforcement
- Can be marked as inactive

### Transaction
- Records all money movements
- Links related transactions (transfers)
- Supports multiple transaction types
- KYC compliance tracking

### KYCProfile
- User identity verification information
- Personal details, address, employment
- Verification status and level tracking
- Review workflow support

### KYCDocument
- Document uploads for verification
- File type validation and size limits
- Admin approval workflow
- Verification history

### KYCVerificationHistory
- Audit trail of all KYC actions
- Admin review tracking
- Status change history

### PiggyBank
- Shared savings goal
- Has target and current amounts
- Tracks progress percentage
- KYC-aware contribution limits

### PiggyBankContribution
- Individual contributions to piggy banks
- Links to wallet and transaction
- KYC validation for large contributions

### PiggyBankMember
- Manages who can contribute to piggy banks
- Tracks invitation and join dates

## KYC Verification Levels & Limits

### Basic KYC
- **Requirements**: Personal info + ID document
- **Daily Limit**: R10,000
- **Use Cases**: Regular transfers and deposits

### Enhanced KYC
- **Requirements**: Basic + proof of address
- **Daily Limit**: R50,000
- **Use Cases**: Business transactions, higher value transfers

### Premium KYC
- **Requirements**: Enhanced + bank statement + employment verification
- **Daily Limit**: R500,000
- **Use Cases**: High-value transactions, business accounts

## Security Features

- **Dual Authentication**: Session-based for users, API key for bots
- **KYC Compliance**: Transaction limits based on verification level
- **User ownership validation** for wallets and transactions
- **Balance validation** for transfers with KYC limits
- **Member permission checks** for piggy banks
- **Document security** with file type and size validation
- **Admin approval workflow** for KYC verification
- **CSRF protection** with bot API exemption
- **Audit trails** for all KYC actions and transactions
- **Soft deletes** for data integrity

## Bot API Management

### Create API Key
```bash
python manage.py create_bot_api_key --name "Trading Bot"
```

### List API Keys
```bash
python manage.py list_bot_api_keys
```

### Bot API Usage
- All bot endpoints are prefixed with `/bot-api/`
- Require `Authorization: Api-Key YOUR_KEY` header
- Bypass CSRF protection
- Read-only access to user data

## Testing

The project includes comprehensive test coverage:
- Model tests for business logic
- API endpoint tests (user and bot APIs)
- Authentication tests (session and API key)
- KYC workflow tests
- Transaction limit validation tests
- Edge case handling

Run tests with: `python manage.py test`

## Admin Interface

Access the Django admin at: http://127.0.0.1:8000/admin/

### Available Admin Interfaces:
- **User Management**: View users with KYC status
- **KYC Profile Review**: Approve/reject verification requests
- **Document Management**: Review uploaded documents
- **KYC History**: View verification audit trail
- **Wallet & Transaction Management**: Monitor financial activity
- **API Key Management**: View and manage bot API keys

All models are registered with custom admin configurations for easy management.

## File Structure

```
backend/
├── api/                    # Main API app
├── users/                  # User management with KYC integration
├── wallet/                 # Wallet, transactions, piggy banks
├── kyc/                    # KYC verification system
├── bot_api/                # Bot API endpoints and middleware
├── manage.py
├── requirements.txt
├── api_usage_example.md    # Detailed API usage guide
└── README.md              # This file
```

## Additional Documentation

- **Comprehensive API Guide**: See `api_usage_example.md` for detailed examples
- **Swagger Documentation**: http://127.0.0.1:8000/api/docs/
- **ReDoc Documentation**: http://127.0.0.1:8000/api/redoc/
