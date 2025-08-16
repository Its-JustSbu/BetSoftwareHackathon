import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { walletAPI } from '../../services/api';
import { Wallet, Transaction } from '../../types';
import { formatCurrency, formatDate, formatTransactionType, getTransactionTypeColor } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

interface WalletDetailsModalProps {
  wallet: Wallet;
  onClose: () => void;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({
  wallet,
  onClose,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [wallet.id]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getTransactions(wallet.id);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{wallet.name}</h2>
                <p className="text-sm text-gray-500">Wallet Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Wallet Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
                  <p className="text-primary-100 mb-2">Current Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(wallet.balance)}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium text-gray-900">{wallet.owner.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">{formatDate(wallet.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      wallet.is_active 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wallet.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN'
                            ? 'bg-success-100'
                            : 'bg-danger-100'
                        }`}>
                          {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN' ? (
                            <ArrowDownRight className="w-5 h-5 text-success-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-danger-600" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatTransactionType(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'TRANSFER_IN' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'COMPLETED' 
                              ? 'bg-success-100 text-success-700'
                              : transaction.status === 'PENDING'
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-danger-100 text-danger-700'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Transactions will appear here once you start using this wallet
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletDetailsModal;
