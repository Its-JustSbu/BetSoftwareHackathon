import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, DollarSign } from 'lucide-react';
import { walletAPI } from '../../services/api';
import { Wallet, WalletDeposit } from '../../types';
import { formatCurrency, validateAmount } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';

interface DepositModalProps {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  wallet,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<WalletDeposit>({
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    setLoading(true);
    setError('');

    try {
      await walletAPI.deposit(wallet.id, formData);
      showSuccess('Money Added!', `${formatCurrency(formData.amount)} has been added to ${wallet.name}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to deposit money';
      setError(errorMessage);
      showError('Deposit Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = ['100', '500', '1000', '2000'];

  const handlePresetAmount = (amount: string) => {
    setFormData(prev => ({
      ...prev,
      amount,
    }));
  };

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
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Deposit Money</h2>
                <p className="text-sm text-gray-500">{wallet.name}</p>
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
            {/* Current Balance */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(wallet.balance)}
              </p>
            </div>

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
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Preset Amounts */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((amount) => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handlePresetAmount(amount)}
                      className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                        formData.amount === amount
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      R{amount}
                    </motion.button>
                  ))}
                </div>
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
                  placeholder="Add a note about this deposit..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Preview */}
              {formData.amount && validateAmount(formData.amount) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-success-50 border border-success-200 rounded-lg p-4"
                >
                  <p className="text-sm text-success-700 mb-2">Transaction Preview</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-success-600">New Balance:</span>
                    <span className="font-semibold text-success-700">
                      {formatCurrency(
                        parseFloat(wallet.balance) + parseFloat(formData.amount)
                      )}
                    </span>
                  </div>
                </motion.div>
              )}

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
                  disabled={loading || !validateAmount(formData.amount)}
                  className="flex-1 btn-success flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Deposit {formData.amount && formatCurrency(formData.amount)}</span>
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

export default DepositModal;
