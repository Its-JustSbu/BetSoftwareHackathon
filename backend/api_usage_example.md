# Wallet Transfer and Piggy Bank API Usage Examples

This document shows how to use the wallet transfer and piggy bank functionality through the REST API.

## Authentication System

This project uses **Django Session Authentication**, not JWT tokens. This means:

1. You need to login first to get a session cookie
2. The session cookie is automatically included in subsequent requests
3. No need for Authorization headers with tokens

## Prerequisites

1. Start the Django development server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Create user accounts and login to get session cookies.

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

## Testing with Two App Instances

To test transfers between users running different app instances:

1. Start the Django server: `python manage.py runserver`
2. Create two user accounts
3. Use different authentication tokens for each user
4. Follow the wallet transfer example above
5. The transfers will work across different client instances as long as they connect to the same backend server

The backend handles all the transaction logic, so transfers between users work regardless of which app instance they're using.
