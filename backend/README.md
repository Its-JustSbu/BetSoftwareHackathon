# Wallet API - MVP

A comprehensive Django REST Framework API for wallet management, peer-to-peer transfers, and bill splitting through piggy banks.

## Features

### 1. User Management
- User registration and authentication
- Custom user model with UUID primary keys
- Session-based authentication

### 2. Wallet Management
- Create multiple wallets per user
- Deposit money into wallets
- View wallet balance and transaction history
- Soft delete wallets (mark as inactive)

### 3. Peer-to-Peer Transfers
- Send money between users using wallet IDs
- Automatic balance validation
- Transaction recording for both sender and recipient
- Linked transaction records for audit trail

### 4. Piggy Bank (Bill Splitting)
- Create shared piggy banks with target amounts
- Invite other users to contribute
- Track contributions from multiple users
- Progress tracking towards target amount
- Member management

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET/PUT /api/auth/profile/` - Get/Update user profile

### Wallets
- `GET/POST /api/wallets/` - List/Create wallets
- `GET/PUT/DELETE /api/wallets/{id}/` - Wallet details
- `POST /api/wallets/{id}/deposit/` - Deposit money
- `POST /api/wallets/{id}/transfer/` - Transfer to another wallet
- `GET /api/wallets/{id}/transactions/` - Wallet transaction history

### Piggy Banks
- `GET/POST /api/piggybanks/` - List/Create piggy banks
- `GET/PUT/DELETE /api/piggybanks/{id}/` - Piggy bank details
- `POST /api/piggybanks/{id}/add-member/` - Add member
- `POST /api/piggybanks/{id}/contribute/` - Contribute money
- `GET /api/piggybanks/{id}/contributions/` - List contributions
- `GET /api/piggybanks/{id}/members/` - List members

## Documentation

- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/
- **OpenAPI Schema**: http://127.0.0.1:8000/api/schema/

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install djangorestframework drf-spectacular
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

4. **Start Development Server**:
   ```bash
   python manage.py runserver
   ```

5. **Run Tests**:
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

### 2. Create a Wallet
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session <session_cookie>" \
  -d '{"name": "My Main Wallet"}'
```

### 3. Deposit Money
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/{wallet_id}/deposit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session <session_cookie>" \
  -d '{
    "amount": "100.00",
    "description": "Initial deposit"
  }'
```

### 4. Transfer Money
```bash
curl -X POST http://127.0.0.1:8000/api/wallets/{wallet_id}/transfer/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session <session_cookie>" \
  -d '{
    "recipient_wallet_id": "recipient-wallet-uuid",
    "amount": "50.00",
    "description": "Payment for dinner"
  }'
```

### 5. Create a Piggy Bank
```bash
curl -X POST http://127.0.0.1:8000/api/piggybanks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session <session_cookie>" \
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

### Wallet
- Belongs to a user
- Has a balance (decimal field)
- Can be marked as inactive

### Transaction
- Records all money movements
- Links related transactions (transfers)
- Supports multiple transaction types

### PiggyBank
- Shared savings goal
- Has target and current amounts
- Tracks progress percentage

### PiggyBankContribution
- Individual contributions to piggy banks
- Links to wallet and transaction

### PiggyBankMember
- Manages who can contribute to piggy banks
- Tracks invitation and join dates

## Security Features

- Session-based authentication
- User ownership validation for wallets
- Balance validation for transfers
- Member permission checks for piggy banks
- Soft deletes for data integrity

## Testing

The project includes comprehensive test coverage:
- Model tests for business logic
- API endpoint tests
- Authentication tests
- Edge case handling

Run tests with: `python manage.py test`

## Admin Interface

Access the Django admin at: http://127.0.0.1:8000/admin/

All models are registered with custom admin configurations for easy management.
