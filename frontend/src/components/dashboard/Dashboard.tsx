import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
  Download,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { walletAPI, piggyBankAPI } from '../../services/api';
import { Wallet as WalletType, PiggyBank as PiggyBankType, Transaction } from '../../types';
import { formatCurrency, formatRelativeTime, formatDate } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import CreateWalletModal from '../wallets/CreateWalletModal';
import CreatePiggyBankModal from '../piggybanks/CreatePiggyBankModal';
import DepositModal from '../wallets/DepositModal';
import TransferModal from '../wallets/TransferModal';
import SendMoneyModal from './SendMoneyModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBankType[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showCreatePiggyBankModal, setShowCreatePiggyBankModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleWalletCreated = (newWallet: WalletType) => {
    setWallets(prev => [newWallet, ...prev]);
    setShowCreateWalletModal(false);
  };

  const handlePiggyBankCreated = (newPiggyBank: PiggyBankType) => {
    setPiggyBanks(prev => [newPiggyBank, ...prev]);
    setShowCreatePiggyBankModal(false);
  };

  const handleSendMoneyComplete = () => {
    loadDashboardData(); // Refresh all data after transfer
    setShowSendMoneyModal(false);
  };

  const handleTransactionComplete = () => {
    loadDashboardData(); // Refresh wallet balances
    setShowDepositModal(false);
    setShowTransferModal(false);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');

      const [walletsResponse, piggyBanksResponse] = await Promise.all([
        walletAPI.getWallets(),
        piggyBankAPI.getPiggyBanks(),
      ]);

      console.log('Wallets response:', walletsResponse.data);
      console.log('PiggyBanks response:', piggyBanksResponse.data);

      // Handle both paginated and non-paginated responses
      const walletData = Array.isArray(walletsResponse.data)
        ? walletsResponse.data
        : (walletsResponse.data?.results || []);

      const piggyBankData = Array.isArray(piggyBanksResponse.data)
        ? piggyBanksResponse.data
        : (piggyBanksResponse.data?.results || []);

      setWallets(walletData);
      setPiggyBanks(piggyBankData);

      console.log('Set wallets:', walletData);
      console.log('Set piggy banks:', piggyBankData);

      // Load recent transactions from the first wallet if available
      if (walletData.length > 0) {
        try {
          const transactionsResponse = await walletAPI.getTransactions(walletData[0].id);
          const transactionData = Array.isArray(transactionsResponse.data)
            ? transactionsResponse.data.slice(0, 5)
            : (transactionsResponse.data?.results?.slice(0, 5) || []);
          setRecentTransactions(transactionData);
          console.log('Set recent transactions:', transactionData);
        } catch (transactionError) {
          console.error('Error loading transactions:', transactionError);
          setRecentTransactions([]);
        }
      } else {
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to Load Data', 'Unable to load your wallet information. Please try refreshing the page.');
      // Set default empty arrays on error
      setWallets([]);
      setPiggyBanks([]);
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = Array.isArray(wallets) ? wallets.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance || '0'),
    0
  ) : 0;

  const totalPiggyBankAmount = Array.isArray(piggyBanks) ? piggyBanks.reduce(
    (sum, piggyBank) => sum + parseFloat(piggyBank.current_amount || '0'),
    0
  ) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your wallets, send money, and track your savings goals
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-primary-100 text-sm">Total Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* My Wallets Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Wallets</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateWalletModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Wallet</span>
          </motion.button>
        </div>

        {Array.isArray(wallets) && wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(wallet.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Balance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setShowDepositModal(true);
                    }}
                    className="btn-success text-sm py-3 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Add Money</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setShowTransferModal(true);
                    }}
                    className="btn-primary text-sm py-3 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Money</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wallets yet</h3>
            <p className="text-gray-500 mb-6">Create your first wallet to start managing your money</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateWalletModal(true)}
              className="btn-primary"
            >
              Create Your First Wallet
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Send Money Section */}
      {Array.isArray(wallets) && wallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Send Money to Anyone</h3>
              <p className="text-blue-100">
                Transfer money to other users instantly by searching their username
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSendMoneyModal(true)}
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Money</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(wallets) ? wallets.length : 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Piggy Banks</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(piggyBanks) ? piggyBanks.length : 0}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPiggyBankAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {Array.isArray(recentTransactions) && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN'
                        ? 'bg-success-100'
                        : 'bg-danger-100'
                    }`}>
                      {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN' ? (
                        <ArrowDownRight className="w-4 h-4 text-success-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-danger-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.transaction_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN'
                      ? 'text-success-600'
                      : 'text-danger-600'
                  }`}>
                    {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent transactions</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateWalletModal(true)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-200 transition-colors">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <p className="font-medium text-gray-900">Create Wallet</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreatePiggyBankModal(true)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-warning-300 hover:bg-warning-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-warning-200 transition-colors">
                  <PiggyBank className="w-6 h-6 text-warning-600" />
                </div>
                <p className="font-medium text-gray-900">New Piggy Bank</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSendMoneyModal(true)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900">Send Money</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showCreateWalletModal && (
        <CreateWalletModal
          onClose={() => setShowCreateWalletModal(false)}
          onWalletCreated={handleWalletCreated}
        />
      )}

      {showCreatePiggyBankModal && (
        <CreatePiggyBankModal
          onClose={() => setShowCreatePiggyBankModal(false)}
          onPiggyBankCreated={handlePiggyBankCreated}
        />
      )}

      {showDepositModal && selectedWallet && (
        <DepositModal
          wallet={selectedWallet}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleTransactionComplete}
        />
      )}

      {showTransferModal && selectedWallet && (
        <TransferModal
          wallet={selectedWallet}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransactionComplete}
        />
      )}

      {showSendMoneyModal && (
        <SendMoneyModal
          onClose={() => setShowSendMoneyModal(false)}
          onSuccess={handleSendMoneyComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
