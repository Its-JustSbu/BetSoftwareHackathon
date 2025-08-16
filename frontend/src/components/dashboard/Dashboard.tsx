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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { walletAPI, piggyBankAPI } from '../../services/api';
import { Wallet as WalletType, PiggyBank as PiggyBankType, Transaction } from '../../types';
import { formatCurrency, formatRelativeTime } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import CreateWalletModal from '../wallets/CreateWalletModal';
import CreatePiggyBankModal from '../piggybanks/CreatePiggyBankModal';
import QuickTransferModal from './QuickTransferModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBankType[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showCreatePiggyBankModal, setShowCreatePiggyBankModal] = useState(false);
  const [showQuickTransferModal, setShowQuickTransferModal] = useState(false);

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

  const handleTransferComplete = () => {
    loadDashboardData(); // Refresh all data after transfer
    setShowQuickTransferModal(false);
    showSuccess('Transfer Completed!', 'Money has been transferred successfully.');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [walletsResponse, piggyBanksResponse] = await Promise.all([
        walletAPI.getWallets(),
        piggyBankAPI.getPiggyBanks(),
      ]);

      // Ensure we have arrays
      setWallets(Array.isArray(walletsResponse.data) ? walletsResponse.data : []);
      setPiggyBanks(Array.isArray(piggyBanksResponse.data) ? piggyBanksResponse.data : []);

      // Load recent transactions from the first wallet if available
      if (Array.isArray(walletsResponse.data) && walletsResponse.data.length > 0) {
        try {
          const transactionsResponse = await walletAPI.getTransactions(
            walletsResponse.data[0].id
          );
          setRecentTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data.slice(0, 5) : []);
        } catch (transactionError) {
          console.error('Error loading transactions:', transactionError);
          setRecentTransactions([]);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h2>
        <p className="text-primary-100">
          Here's an overview of your financial activity
        </p>
      </motion.div>

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
              onClick={() => setShowQuickTransferModal(true)}
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

      {showQuickTransferModal && (
        <QuickTransferModal
          onClose={() => setShowQuickTransferModal(false)}
          onSuccess={handleTransferComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
