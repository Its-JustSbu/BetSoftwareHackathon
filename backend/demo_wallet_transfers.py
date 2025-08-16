#!/usr/bin/env python
"""
Demo script showing wallet transfer and piggy bank functionality.

This script demonstrates:
1. Two users creating wallets and transferring money between them
2. Multiple users contributing to a piggy bank and using it to pay bills

Run this script with: python manage.py shell < demo_wallet_transfers.py
"""

import os
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from wallet.models import Wallet, Transaction, PiggyBank, PiggyBankContribution, PiggyBankMember

def demo_wallet_transfers():
    """Demonstrate wallet transfers between two users."""
    print("=" * 60)
    print("DEMO 1: WALLET TRANSFERS BETWEEN USERS")
    print("=" * 60)
    
    # Clean up any existing demo data
    User.objects.filter(username__in=['alice', 'bob']).delete()
    
    # Create two users
    alice = User.objects.create_user(username='alice', email='alice@example.com', password='demo123')
    bob = User.objects.create_user(username='bob', email='bob@example.com', password='demo123')
    
    print(f"Created users: {alice.username} and {bob.username}")
    
    # Create wallets for both users
    alice_wallet = Wallet.objects.create(owner=alice, name="Alice's Main Wallet")
    bob_wallet = Wallet.objects.create(owner=bob, name="Bob's Main Wallet")
    
    print(f"Created wallets:")
    print(f"  - {alice_wallet.name}: R{alice_wallet.balance}")
    print(f"  - {bob_wallet.name}: R{bob_wallet.balance}")
    
    # Alice deposits R500
    alice_deposit = Transaction.objects.create(
        wallet=alice_wallet,
        transaction_type='DEPOSIT',
        amount=Decimal('500.00'),
        status='COMPLETED',
        description='Initial deposit'
    )
    alice_wallet.balance += alice_deposit.amount
    alice_wallet.save()
    
    # Bob deposits R400
    bob_deposit = Transaction.objects.create(
        wallet=bob_wallet,
        transaction_type='DEPOSIT',
        amount=Decimal('400.00'),
        status='COMPLETED',
        description='Initial deposit'
    )
    bob_wallet.balance += bob_deposit.amount
    bob_wallet.save()
    
    print(f"\nAfter deposits:")
    print(f"  - {alice_wallet.name}: R{alice_wallet.balance}")
    print(f"  - {bob_wallet.name}: R{bob_wallet.balance}")
    
    # Alice transfers R100 to Bob
    transfer_amount = Decimal('100.00')
    
    # Create outgoing transaction for Alice
    alice_transfer_out = Transaction.objects.create(
        wallet=alice_wallet,
        transaction_type='TRANSFER_OUT',
        amount=transfer_amount,
        status='COMPLETED',
        description=f"Transfer to {bob.username}",
        related_wallet=bob_wallet
    )
    
    # Create incoming transaction for Bob
    bob_transfer_in = Transaction.objects.create(
        wallet=bob_wallet,
        transaction_type='TRANSFER_IN',
        amount=transfer_amount,
        status='COMPLETED',
        description=f"Transfer from {alice.username}",
        related_wallet=alice_wallet,
        related_transaction=alice_transfer_out
    )
    
    # Link transactions
    alice_transfer_out.related_transaction = bob_transfer_in
    alice_transfer_out.save()
    
    # Update balances
    alice_wallet.balance -= transfer_amount
    alice_wallet.save()
    bob_wallet.balance += transfer_amount
    bob_wallet.save()
    
    print(f"\nAfter Alice transfers R{transfer_amount} to Bob:")
    print(f"  - {alice_wallet.name}: R{alice_wallet.balance}")
    print(f"  - {bob_wallet.name}: R{bob_wallet.balance}")
    
    # Show transaction history
    print(f"\nAlice's transaction history:")
    for txn in alice_wallet.transactions.all():
        print(f"  - {txn.transaction_type}: R{txn.amount} - {txn.description}")
    
    print(f"\nBob's transaction history:")
    for txn in bob_wallet.transactions.all():
        print(f"  - {txn.transaction_type}: R{txn.amount} - {txn.description}")


def demo_piggy_bank():
    """Demonstrate piggy bank functionality for bill splitting."""
    print("\n" + "=" * 60)
    print("DEMO 2: PIGGY BANK FOR RESTAURANT BILL SPLITTING")
    print("=" * 60)
    
    # Clean up any existing demo data
    User.objects.filter(username__in=['creator', 'friend1', 'friend2', 'friend3', 'restaurant']).delete()
    
    # Create users
    creator = User.objects.create_user(username='creator', email='creator@example.com', password='demo123')
    friend1 = User.objects.create_user(username='friend1', email='friend1@example.com', password='demo123')
    friend2 = User.objects.create_user(username='friend2', email='friend2@example.com', password='demo123')
    friend3 = User.objects.create_user(username='friend3', email='friend3@example.com', password='demo123')
    restaurant = User.objects.create_user(username='restaurant', email='restaurant@example.com', password='demo123')
    
    print(f"Created users: {creator.username}, {friend1.username}, {friend2.username}, {friend3.username}, {restaurant.username}")
    
    # Create piggy bank for restaurant bill
    piggy_bank = PiggyBank.objects.create(
        name='Restaurant Dinner Bill',
        description='Splitting the bill for our fancy dinner',
        creator=creator,
        target_amount=Decimal('300.00')
    )
    
    print(f"\nCreated piggy bank: {piggy_bank.name}")
    print(f"Target amount: R{piggy_bank.target_amount}")
    print(f"Current amount: R{piggy_bank.current_amount}")
    
    # Add members to piggy bank
    members = [friend1, friend2, friend3]
    for member in members:
        PiggyBankMember.objects.create(piggy_bank=piggy_bank, user=member)
    
    print(f"\nAdded {len(members)} members to piggy bank")
    
    # Create wallets and contributions
    contributions = [
        (creator, Decimal('50.00'), Decimal('200.00')),  # (user, contribution, initial_balance)
        (friend1, Decimal('100.00'), Decimal('150.00')),
        (friend2, Decimal('80.00'), Decimal('120.00')),
        (friend3, Decimal('70.00'), Decimal('100.00')),
    ]
    
    print(f"\nUsers contributing to piggy bank:")
    
    for user, contribution_amount, initial_balance in contributions:
        # Create wallet
        wallet = Wallet.objects.create(owner=user, name=f"{user.username}'s Wallet")
        
        # Add initial balance
        deposit = Transaction.objects.create(
            wallet=wallet,
            transaction_type='DEPOSIT',
            amount=initial_balance,
            status='COMPLETED',
            description='Initial funds'
        )
        wallet.balance = initial_balance
        wallet.save()
        
        # Contribute to piggy bank
        contribution_txn = Transaction.objects.create(
            wallet=wallet,
            transaction_type='PIGGYBANK_CONTRIBUTION',
            amount=contribution_amount,
            status='COMPLETED',
            description=f'Contribution to {piggy_bank.name}',
            reference_id=str(piggy_bank.id)
        )
        
        contribution = PiggyBankContribution.objects.create(
            piggy_bank=piggy_bank,
            contributor=user,
            wallet=wallet,
            amount=contribution_amount,
            transaction=contribution_txn
        )
        
        # Update balances
        wallet.balance -= contribution_amount
        wallet.save()
        piggy_bank.current_amount += contribution_amount
        piggy_bank.save()
        
        print(f"  - {user.username}: contributed R{contribution_amount}, wallet balance: R{wallet.balance}")
    
    print(f"\nPiggy bank status:")
    print(f"  - Current amount: R{piggy_bank.current_amount}")
    print(f"  - Target amount: R{piggy_bank.target_amount}")
    print(f"  - Progress: {piggy_bank.progress_percentage:.1f}%")
    print(f"  - Target reached: {piggy_bank.is_target_reached}")
    
    # Create restaurant wallet
    restaurant_wallet = Wallet.objects.create(owner=restaurant, name="Restaurant Wallet")
    
    # Pay restaurant bill from piggy bank
    payment_amount = piggy_bank.current_amount  # Pay the full amount
    
    payment_txn = Transaction.objects.create(
        wallet=restaurant_wallet,
        transaction_type='TRANSFER_IN',
        amount=payment_amount,
        status='COMPLETED',
        description=f'Payment from {piggy_bank.name}',
        reference_id=str(piggy_bank.id)
    )
    
    # Update balances
    restaurant_wallet.balance += payment_amount
    restaurant_wallet.save()
    piggy_bank.current_amount -= payment_amount
    piggy_bank.save()
    
    print(f"\nPaid restaurant bill:")
    print(f"  - Amount paid: R{payment_amount}")
    print(f"  - Restaurant wallet balance: R{restaurant_wallet.balance}")
    print(f"  - Piggy bank remaining: R{piggy_bank.current_amount}")
    
    # Show contribution summary
    print(f"\nContribution summary:")
    for contribution in PiggyBankContribution.objects.filter(piggy_bank=piggy_bank):
        print(f"  - {contribution.contributor.username}: R{contribution.amount}")


if __name__ == "__main__":
    demo_wallet_transfers()
    demo_piggy_bank()
    print("\n" + "=" * 60)
    print("DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 60)
