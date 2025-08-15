from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from users.models import User
from .models import Wallet, Transaction, PiggyBank, PiggyBankContribution, PiggyBankMember


class WalletModelTest(TestCase):
    """Test cases for Wallet model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_wallet_creation(self):
        """Test wallet creation"""
        wallet = Wallet.objects.create(
            owner=self.user,
            name='Test Wallet'
        )
        self.assertEqual(wallet.owner, self.user)
        self.assertEqual(wallet.name, 'Test Wallet')
        self.assertEqual(wallet.balance, Decimal('0.00'))
        self.assertTrue(wallet.is_active)

    def test_can_debit(self):
        """Test wallet can_debit method"""
        wallet = Wallet.objects.create(
            owner=self.user,
            name='Test Wallet',
            balance=Decimal('100.00')
        )
        self.assertTrue(wallet.can_debit(Decimal('50.00')))
        self.assertTrue(wallet.can_debit(Decimal('100.00')))
        self.assertFalse(wallet.can_debit(Decimal('150.00')))


class WalletAPITest(APITestCase):
    """Test cases for Wallet API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_wallet(self):
        """Test wallet creation via API"""
        url = reverse('wallet-list-create')
        data = {'name': 'My New Wallet'}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wallet.objects.count(), 1)
        wallet = Wallet.objects.first()
        self.assertEqual(wallet.owner, self.user)
        self.assertEqual(wallet.name, 'My New Wallet')

    def test_list_wallets(self):
        """Test listing user's wallets"""
        Wallet.objects.create(owner=self.user, name='Wallet 1')
        Wallet.objects.create(owner=self.user, name='Wallet 2')
        Wallet.objects.create(owner=self.other_user, name='Other Wallet')

        url = reverse('wallet-list-create')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_deposit_money(self):
        """Test depositing money to wallet"""
        wallet = Wallet.objects.create(owner=self.user, name='Test Wallet')
        url = reverse('wallet-deposit', kwargs={'wallet_id': wallet.id})
        data = {'amount': '100.00', 'description': 'Test deposit'}

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        wallet.refresh_from_db()
        self.assertEqual(wallet.balance, Decimal('100.00'))
        self.assertEqual(Transaction.objects.count(), 1)

        transaction = Transaction.objects.first()
        self.assertEqual(transaction.transaction_type, 'DEPOSIT')
        self.assertEqual(transaction.amount, Decimal('100.00'))

    def test_transfer_money(self):
        """Test transferring money between wallets"""
        sender_wallet = Wallet.objects.create(
            owner=self.user,
            name='Sender Wallet',
            balance=Decimal('200.00')
        )
        recipient_wallet = Wallet.objects.create(
            owner=self.other_user,
            name='Recipient Wallet'
        )

        url = reverse('wallet-transfer', kwargs={'wallet_id': sender_wallet.id})
        data = {
            'recipient_wallet_id': str(recipient_wallet.id),
            'amount': '50.00',
            'description': 'Test transfer'
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        sender_wallet.refresh_from_db()
        recipient_wallet.refresh_from_db()

        self.assertEqual(sender_wallet.balance, Decimal('150.00'))
        self.assertEqual(recipient_wallet.balance, Decimal('50.00'))
        self.assertEqual(Transaction.objects.count(), 2)

    def test_transfer_insufficient_balance(self):
        """Test transfer with insufficient balance"""
        sender_wallet = Wallet.objects.create(
            owner=self.user,
            name='Sender Wallet',
            balance=Decimal('30.00')
        )
        recipient_wallet = Wallet.objects.create(
            owner=self.other_user,
            name='Recipient Wallet'
        )

        url = reverse('wallet-transfer', kwargs={'wallet_id': sender_wallet.id})
        data = {
            'recipient_wallet_id': str(recipient_wallet.id),
            'amount': '50.00'
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient balance', response.data['error'])


class PiggyBankAPITest(APITestCase):
    """Test cases for PiggyBank API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_piggybank(self):
        """Test creating a piggy bank"""
        url = reverse('piggybank-list-create')
        data = {
            'name': 'Vacation Fund',
            'description': 'Saving for vacation',
            'target_amount': '1000.00'
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PiggyBank.objects.count(), 1)
        piggy_bank = PiggyBank.objects.first()
        self.assertEqual(piggy_bank.creator, self.user)
        self.assertEqual(piggy_bank.name, 'Vacation Fund')

    def test_add_member_to_piggybank(self):
        """Test adding a member to piggy bank"""
        piggy_bank = PiggyBank.objects.create(
            name='Test Fund',
            creator=self.user,
            target_amount=Decimal('500.00')
        )

        url = reverse('piggybank-add-member', kwargs={'piggybank_id': piggy_bank.id})
        data = {'username': 'otheruser'}

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PiggyBankMember.objects.count(), 1)
        member = PiggyBankMember.objects.first()
        self.assertEqual(member.user, self.other_user)
        self.assertEqual(member.piggy_bank, piggy_bank)

    def test_contribute_to_piggybank(self):
        """Test contributing to a piggy bank"""
        wallet = Wallet.objects.create(
            owner=self.user,
            name='Test Wallet',
            balance=Decimal('200.00')
        )
        piggy_bank = PiggyBank.objects.create(
            name='Test Fund',
            creator=self.user,
            target_amount=Decimal('500.00')
        )

        url = reverse('piggybank-contribute', kwargs={'piggybank_id': piggy_bank.id})
        data = {
            'wallet_id': str(wallet.id),
            'amount': '50.00'
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        wallet.refresh_from_db()
        piggy_bank.refresh_from_db()

        self.assertEqual(wallet.balance, Decimal('150.00'))
        self.assertEqual(piggy_bank.current_amount, Decimal('50.00'))
        self.assertEqual(PiggyBankContribution.objects.count(), 1)

    def test_contribute_insufficient_balance(self):
        """Test contributing with insufficient balance"""
        wallet = Wallet.objects.create(
            owner=self.user,
            name='Test Wallet',
            balance=Decimal('30.00')
        )
        piggy_bank = PiggyBank.objects.create(
            name='Test Fund',
            creator=self.user,
            target_amount=Decimal('500.00')
        )

        url = reverse('piggybank-contribute', kwargs={'piggybank_id': piggy_bank.id})
        data = {
            'wallet_id': str(wallet.id),
            'amount': '50.00'
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient balance', response.data['error'])


class WalletTransferIntegrationTest(APITestCase):
    """Integration tests for wallet transfers between users"""

    def setUp(self):
        # Create two users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )

    def test_two_users_wallet_transfer_scenario(self):
        """
        Test scenario: Two users create wallets, deposit money, and transfer between them
        User1: R500 -> sends R100 to User2 -> R400
        User2: R400 -> receives R100 from User1 -> R500
        """
        # User 1 creates wallet and deposits R500
        self.client.force_authenticate(user=self.user1)

        # Create wallet for user1
        wallet1_data = {'name': 'User1 Main Wallet'}
        response = self.client.post('/api/wallets/', wallet1_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        wallet1_id = response.data['id']

        # Deposit R500 to user1's wallet
        deposit_data = {'amount': '500.00', 'description': 'Initial deposit'}
        response = self.client.post(f'/api/wallets/{wallet1_id}/deposit/', deposit_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # User 2 creates wallet and deposits R400
        self.client.force_authenticate(user=self.user2)

        # Create wallet for user2
        wallet2_data = {'name': 'User2 Main Wallet'}
        response = self.client.post('/api/wallets/', wallet2_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        wallet2_id = response.data['id']

        # Deposit R400 to user2's wallet
        deposit_data = {'amount': '400.00', 'description': 'Initial deposit'}
        response = self.client.post(f'/api/wallets/{wallet2_id}/deposit/', deposit_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # User1 transfers R100 to User2
        self.client.force_authenticate(user=self.user1)
        transfer_data = {
            'recipient_wallet_id': wallet2_id,
            'amount': '100.00',
            'description': 'Transfer to friend'
        }
        response = self.client.post(f'/api/wallets/{wallet1_id}/transfer/', transfer_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify final balances
        # User1 should have R400
        wallet1 = Wallet.objects.get(id=wallet1_id)
        self.assertEqual(wallet1.balance, Decimal('400.00'))

        # User2 should have R500
        wallet2 = Wallet.objects.get(id=wallet2_id)
        self.assertEqual(wallet2.balance, Decimal('500.00'))

        # Verify transactions were created
        user1_transactions = Transaction.objects.filter(wallet=wallet1)
        self.assertEqual(user1_transactions.count(), 2)  # 1 deposit + 1 transfer out

        user2_transactions = Transaction.objects.filter(wallet=wallet2)
        self.assertEqual(user2_transactions.count(), 2)  # 1 deposit + 1 transfer in

        # Verify transfer transaction details
        transfer_out = user1_transactions.filter(transaction_type='TRANSFER_OUT').first()
        transfer_in = user2_transactions.filter(transaction_type='TRANSFER_IN').first()

        self.assertEqual(transfer_out.amount, Decimal('100.00'))
        self.assertEqual(transfer_in.amount, Decimal('100.00'))
        self.assertEqual(transfer_out.related_transaction, transfer_in)
        self.assertEqual(transfer_in.related_transaction, transfer_out)


class PiggyBankIntegrationTest(APITestCase):
    """Integration tests for piggy bank functionality"""

    def setUp(self):
        # Create 4 users for the piggy bank scenario
        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )
        self.user1 = User.objects.create_user(
            username='contributor1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='contributor2',
            email='user2@example.com',
            password='testpass123'
        )
        self.user3 = User.objects.create_user(
            username='contributor3',
            email='user3@example.com',
            password='testpass123'
        )

    def test_piggy_bank_restaurant_bill_scenario(self):
        """
        Test scenario: One user creates a piggy bank for restaurant bill (R300),
        3 users contribute money, then use piggy bank to pay restaurant bill
        """
        # Creator creates piggy bank for restaurant bill
        self.client.force_authenticate(user=self.creator)

        piggy_bank_data = {
            'name': 'Restaurant Bill',
            'description': 'Splitting dinner bill at fancy restaurant',
            'target_amount': '300.00'
        }
        response = self.client.post('/api/piggybanks/', piggy_bank_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        piggy_bank_id = response.data['id']

        # Creator creates wallet and adds some money
        wallet_creator_data = {'name': 'Creator Wallet'}
        response = self.client.post('/api/wallets/', wallet_creator_data)
        creator_wallet_id = response.data['id']

        deposit_data = {'amount': '200.00', 'description': 'Initial funds'}
        self.client.post(f'/api/wallets/{creator_wallet_id}/deposit/', deposit_data)

        # Add members to piggy bank
        for user in [self.user1, self.user2, self.user3]:
            member_data = {'username': user.username}
            response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/add-member/', member_data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Each user creates wallet and contributes to piggy bank
        contributions = [
            (self.user1, '100.00', '150.00'),  # (user, contribution, initial_wallet_balance)
            (self.user2, '80.00', '120.00'),
            (self.user3, '70.00', '100.00'),
        ]

        user_wallets = {}

        for user, contribution_amount, initial_balance in contributions:
            self.client.force_authenticate(user=user)

            # Create wallet
            wallet_data = {'name': f'{user.username} Wallet'}
            response = self.client.post('/api/wallets/', wallet_data)
            wallet_id = response.data['id']
            user_wallets[user.username] = wallet_id

            # Deposit initial balance
            deposit_data = {'amount': initial_balance, 'description': 'Initial funds'}
            self.client.post(f'/api/wallets/{wallet_id}/deposit/', deposit_data)

            # Contribute to piggy bank
            contribute_data = {
                'wallet_id': wallet_id,
                'amount': contribution_amount
            }
            response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/contribute/', contribute_data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Creator also contributes
        self.client.force_authenticate(user=self.creator)
        contribute_data = {
            'wallet_id': creator_wallet_id,
            'amount': '50.00'
        }
        response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/contribute/', contribute_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify piggy bank has collected R300 (100 + 80 + 70 + 50)
        piggy_bank = PiggyBank.objects.get(id=piggy_bank_id)
        self.assertEqual(piggy_bank.current_amount, Decimal('300.00'))
        self.assertTrue(piggy_bank.is_target_reached)

        # Verify individual wallet balances after contributions
        expected_balances = {
            self.user1.username: Decimal('50.00'),  # 150 - 100
            self.user2.username: Decimal('40.00'),  # 120 - 80
            self.user3.username: Decimal('30.00'),  # 100 - 70
            self.creator.username: Decimal('150.00'),  # 200 - 50
        }

        for username, expected_balance in expected_balances.items():
            if username == self.creator.username:
                wallet_id = creator_wallet_id
            else:
                wallet_id = user_wallets[username]
            wallet = Wallet.objects.get(id=wallet_id)
            self.assertEqual(wallet.balance, expected_balance)

        # Verify contributions were recorded
        contributions_count = PiggyBankContribution.objects.filter(piggy_bank=piggy_bank).count()
        self.assertEqual(contributions_count, 4)  # 3 members + 1 creator

        # Verify total contribution amounts
        total_contributions = sum([
            contribution.amount
            for contribution in PiggyBankContribution.objects.filter(piggy_bank=piggy_bank)
        ])
        self.assertEqual(total_contributions, Decimal('300.00'))

        # Test that piggy bank members can view contributions
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/piggybanks/{piggy_bank_id}/contributions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

        # Test that piggy bank members can view other members
        response = self.client.get(f'/api/piggybanks/{piggy_bank_id}/members/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should have 3 added members (creator is not in members list)
        self.assertGreaterEqual(len(response.data), 3)

        # Now use the piggy bank to pay the restaurant bill
        # Create a restaurant wallet to receive payment
        restaurant_user = User.objects.create_user(
            username='restaurant',
            email='restaurant@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=restaurant_user)

        restaurant_wallet_data = {'name': 'Restaurant Wallet'}
        response = self.client.post('/api/wallets/', restaurant_wallet_data)
        restaurant_wallet_id = response.data['id']

        # Creator pays the restaurant bill from piggy bank
        self.client.force_authenticate(user=self.creator)
        payment_data = {
            'recipient_wallet_id': restaurant_wallet_id,
            'amount': '300.00',
            'description': 'Restaurant dinner bill payment'
        }
        response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/pay/', payment_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify restaurant received the payment
        restaurant_wallet = Wallet.objects.get(id=restaurant_wallet_id)
        self.assertEqual(restaurant_wallet.balance, Decimal('300.00'))

        # Verify piggy bank balance is now zero
        piggy_bank.refresh_from_db()
        self.assertEqual(piggy_bank.current_amount, Decimal('0.00'))

        # Verify transaction was created
        restaurant_transactions = Transaction.objects.filter(wallet=restaurant_wallet)
        self.assertEqual(restaurant_transactions.count(), 1)

        payment_transaction = restaurant_transactions.first()
        self.assertEqual(payment_transaction.transaction_type, 'TRANSFER_IN')
        self.assertEqual(payment_transaction.amount, Decimal('300.00'))
        self.assertIn('Restaurant dinner bill payment', payment_transaction.description)

    def test_piggy_bank_payment_insufficient_funds(self):
        """Test payment from piggy bank with insufficient funds"""
        self.client.force_authenticate(user=self.creator)

        # Create piggy bank with only R50
        piggy_bank_data = {
            'name': 'Small Fund',
            'description': 'Small piggy bank',
            'target_amount': '100.00'
        }
        response = self.client.post('/api/piggybanks/', piggy_bank_data)
        piggy_bank_id = response.data['id']

        # Add R50 to piggy bank
        wallet_data = {'name': 'Test Wallet'}
        response = self.client.post('/api/wallets/', wallet_data)
        wallet_id = response.data['id']

        deposit_data = {'amount': '100.00', 'description': 'Initial funds'}
        self.client.post(f'/api/wallets/{wallet_id}/deposit/', deposit_data)

        contribute_data = {'wallet_id': wallet_id, 'amount': '50.00'}
        self.client.post(f'/api/piggybanks/{piggy_bank_id}/contribute/', contribute_data)

        # Create recipient wallet
        recipient_user = User.objects.create_user(
            username='recipient',
            email='recipient@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=recipient_user)

        recipient_wallet_data = {'name': 'Recipient Wallet'}
        response = self.client.post('/api/wallets/', recipient_wallet_data)
        recipient_wallet_id = response.data['id']

        # Try to pay R100 from piggy bank that only has R50
        self.client.force_authenticate(user=self.creator)
        payment_data = {
            'recipient_wallet_id': recipient_wallet_id,
            'amount': '100.00',
            'description': 'Overpayment attempt'
        }
        response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/pay/', payment_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient funds', response.data['error'])

    def test_piggy_bank_payment_unauthorized_user(self):
        """Test that only creator can make payments from piggy bank"""
        self.client.force_authenticate(user=self.creator)

        # Create piggy bank
        piggy_bank_data = {
            'name': 'Test Fund',
            'description': 'Test piggy bank',
            'target_amount': '100.00'
        }
        response = self.client.post('/api/piggybanks/', piggy_bank_data)
        piggy_bank_id = response.data['id']

        # Create recipient wallet
        recipient_user = User.objects.create_user(
            username='recipient',
            email='recipient@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=recipient_user)

        recipient_wallet_data = {'name': 'Recipient Wallet'}
        response = self.client.post('/api/wallets/', recipient_wallet_data)
        recipient_wallet_id = response.data['id']

        # Try to make payment as non-creator user
        self.client.force_authenticate(user=self.user1)
        payment_data = {
            'recipient_wallet_id': recipient_wallet_id,
            'amount': '50.00',
            'description': 'Unauthorized payment attempt'
        }
        response = self.client.post(f'/api/piggybanks/{piggy_bank_id}/pay/', payment_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only the creator', response.data['error'])
