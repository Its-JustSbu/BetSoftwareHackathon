import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { walletAPI, piggyBankAPI } from '../../services/api';
import { Wallet as WalletType, PiggyBank as PiggyBankType, Transaction } from '../../types';
import { formatCurrency } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

const Analytics: React.FC = () => {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBankType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [walletsResponse, piggyBanksResponse] = await Promise.all([
        walletAPI.getWallets(),
        piggyBankAPI.getPiggyBanks(),
      ]);

      console.log(walletsResponse.data);
      setWallets(walletsResponse.data);
      setPiggyBanks(piggyBanksResponse.data || []);

      // Load transactions from all wallets
      const transactionPromises = walletsResponse.data.map(wallet =>
        walletAPI.getTransactions(wallet.id)
      );
      
      const transactionResponses = await Promise.all(transactionPromises);
      const allTxns = transactionResponses.flatMap(response => response.data);
      setTransactions(allTxns);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalBalance = Array.isArray(wallets)
  ? wallets.reduce<number>((sum, wallet) => sum + parseFloat(wallet.balance), 0)
  : 0;
  const totalSavings = Array.isArray(piggyBanks) 
  ? piggyBanks.reduce<number>((sum, pb) => sum + parseFloat(pb.current_amount), 0)
  : 0;
  
  const deposits = transactions.filter(t => t.transaction_type === 'DEPOSIT');
  const transfers = transactions.filter(t => t.transaction_type === 'TRANSFER_OUT');
  const contributions = transactions.filter(t => t.transaction_type === 'PIGGYBANK_CONTRIBUTION');

  const totalDeposits = Array.isArray(wallets) 
  ? deposits.reduce<number>((sum, t) => sum + parseFloat(t.amount), 0) 
  : 0;
  const totalTransfers = Array.isArray(wallets) 
  ? transfers.reduce<number>((sum, t) => sum + parseFloat(t.amount), 0)
  : 0;
  const totalContributions = Array.isArray(wallets) 
  ? contributions.reduce<number>((sum, t) => sum + parseFloat(t.amount), 0)
  : 0;

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your financial activity and trends</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="input-field w-auto"
        >
          {timeRanges.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Cards */}
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
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSavings)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600">+8.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-warning-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalDeposits)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600">+15.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalTransfers)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-danger-500 mr-1" />
                <span className="text-sm text-danger-600">-3.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Breakdown</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success-500 rounded-full"></div>
                <span className="text-gray-700">Deposits</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(totalDeposits)}</p>
                <p className="text-sm text-gray-500">{deposits.length} transactions</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Transfers</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(totalTransfers)}</p>
                <p className="text-sm text-gray-500">{transfers.length} transactions</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-warning-500 rounded-full"></div>
                <span className="text-gray-700">Contributions</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(totalContributions)}</p>
                <p className="text-sm text-gray-500">{contributions.length} transactions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wallet Distribution</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {/* {wallets && wallets.map((wallet, index) => {
              const percentage = totalBalance > 0 ? (parseFloat(wallet.balance) / totalBalance) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{wallet.name}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(wallet.balance)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                      className="h-2 bg-primary-500 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
                </div>
              );
            })} */}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{wallets.length}</p>
            <p className="text-gray-600">Active Wallets</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PiggyBank className="w-8 h-8 text-warning-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{piggyBanks.length}</p>
            <p className="text-gray-600">Piggy Banks</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-success-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            <p className="text-gray-600">Total Transactions</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
