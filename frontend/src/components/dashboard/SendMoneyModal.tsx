import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, User, Search, Wallet as WalletIcon } from 'lucide-react';
import { walletAPI, authAPI } from '../../services/api';
import { Wallet, User as UserType } from '../../types';
import { formatCurrency, validateAmount } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';

interface SendMoneyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState<'select-wallet' | 'select-recipient' | 'enter-amount'>('select-wallet');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [recipientWallets, setRecipientWallets] = useState<Wallet[]>([]);
  const [selectedRecipientWallet, setSelectedRecipientWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadWallets = async () => {
    try {
      const response = await walletAPI.getWallets();
      setWallets(response.data.filter(w => w.is_active));
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchLoading(true);
      const response = await authAPI.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setStep('select-recipient');
  };

  const handleUserSelect = async (user: UserType) => {
    setSelectedUser(user);
    // In a real app, you'd fetch the user's wallets here
    // For now, we'll simulate that they have a default wallet
    const mockWallet: Wallet = {
      id: `user-${user.id}-wallet`,
      name: `${user.username}'s Wallet`,
      balance: '0.00',
      owner: user,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRecipientWallets([mockWallet]);
    setSelectedRecipientWallet(mockWallet);
    setStep('enter-amount');
  };

  const handleSendMoney = async () => {
    if (!selectedWallet || !selectedRecipientWallet || !validateAmount(amount)) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) > parseFloat(selectedWallet.balance)) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await walletAPI.transfer(selectedWallet.id, {
        recipient_wallet_id: selectedRecipientWallet.id,
        amount,
        description,
      });
      
      showSuccess(
        'Money Sent!', 
        `${formatCurrency(amount)} has been sent to ${selectedUser?.username}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send money';
      setError(errorMessage);
      showError('Transfer Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select-wallet':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Your Wallet</h3>
            <p className="text-gray-600">Choose which wallet to send money from</p>
            
            {wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWalletSelect(wallet)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <WalletIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{wallet.name}</p>
                          <p className="text-sm text-gray-500">Available balance</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No wallets available</p>
              </div>
            )}
          </div>
        );

      case 'select-recipient':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Send Money To</h3>
              <button
                onClick={() => setStep('select-wallet')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Change Wallet
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedWallet?.name}</p>
                  <p className="text-sm text-gray-500">
                    Balance: {formatCurrency(selectedWallet?.balance || '0')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {searchLoading && (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <motion.button
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        );

      case 'enter-amount':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Enter Amount</h3>
              <button
                onClick={() => setStep('select-recipient')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Change Recipient
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <WalletIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{selectedWallet?.name}</span>
                </div>
                <span className="text-gray-600">→</span>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{selectedUser?.username}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={selectedWallet?.balance}
                  className="input-field pl-10"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum: {formatCurrency(selectedWallet?.balance || '0')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this for?"
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendMoney}
              disabled={loading || !validateAmount(amount)}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send {amount && formatCurrency(amount)}</span>
                </>
              )}
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Send Money</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {renderStepContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SendMoneyModal;
