import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Wallet as WalletIcon, User } from 'lucide-react';
import { walletAPI } from '../../services/api';
import { Wallet, WalletTransfer } from '../../types';
import { formatCurrency, validateAmount } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

interface QuickTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<WalletTransfer & { from_wallet_id: string }>({
    from_wallet_id: '',
    recipient_wallet_id: '',
    amount: '',
    description: '',
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await walletAPI.getWallets();
      setWallets(response.data.filter(w => w.is_active));
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAmount(formData.amount)) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.from_wallet_id) {
      setError('Please select a source wallet');
      return;
    }

    if (!formData.recipient_wallet_id) {
      setError('Please select a recipient wallet');
      return;
    }

    if (formData.from_wallet_id === formData.recipient_wallet_id) {
      setError('Source and recipient wallets cannot be the same');
      return;
    }

    const sourceWallet = wallets.find(w => w.id === formData.from_wallet_id);
    if (sourceWallet && parseFloat(formData.amount) > parseFloat(sourceWallet.balance)) {
      setError('Insufficient balance in source wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const transferData: WalletTransfer = {
        recipient_wallet_id: formData.recipient_wallet_id,
        amount: formData.amount,
        description: formData.description,
      };
      
      await walletAPI.transfer(formData.from_wallet_id, transferData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer money');
    } finally {
      setLoading(false);
    }
  };

  const sourceWallet = wallets.find(w => w.id === formData.from_wallet_id);
  const recipientWallet = wallets.find(w => w.id === formData.recipient_wallet_id);
  const availableRecipients = wallets.filter(w => w.id !== formData.from_wallet_id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quick Transfer</h2>
                <p className="text-sm text-gray-500">Send money between wallets</p>
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
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="from_wallet_id" className="block text-sm font-medium text-gray-700 mb-2">
                  From Wallet
                </label>
                {loadingWallets ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : wallets.length > 0 ? (
                  <select
                    id="from_wallet_id"
                    name="from_wallet_id"
                    value={formData.from_wallet_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select source wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No wallets available
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="recipient_wallet_id" className="block text-sm font-medium text-gray-700 mb-2">
                  To Wallet
                </label>
                <select
                  id="recipient_wallet_id"
                  name="recipient_wallet_id"
                  value={formData.recipient_wallet_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={!formData.from_wallet_id}
                >
                  <option value="">Select recipient wallet</option>
                  {availableRecipients.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {wallet.owner.username} ({formatCurrency(wallet.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {sourceWallet && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <WalletIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{sourceWallet.name}</p>
                      <p className="text-sm text-blue-700">
                        Available: {formatCurrency(sourceWallet.balance)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={sourceWallet?.balance || undefined}
                    className="input-field pl-10"
                    required
                  />
                </div>
                {sourceWallet && (
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum: {formatCurrency(sourceWallet.balance)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a note about this transfer..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !validateAmount(formData.amount) || !formData.from_wallet_id || !formData.recipient_wallet_id}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transfer {formData.amount && formatCurrency(formData.amount)}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickTransferModal;
