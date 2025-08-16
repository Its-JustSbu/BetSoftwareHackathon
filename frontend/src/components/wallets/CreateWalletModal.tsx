import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import { walletAPI } from '../../services/api';
import { Wallet as WalletType, WalletCreate } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';

interface CreateWalletModalProps {
  onClose: () => void;
  onWalletCreated: (wallet: WalletType) => void;
}

const CreateWalletModal: React.FC<CreateWalletModalProps> = ({
  onClose,
  onWalletCreated,
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<WalletCreate>({
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Wallet name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await walletAPI.createWallet(formData);
      showSuccess('Wallet Created!', `${formData.name} has been created successfully.`);
      onWalletCreated(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create wallet';
      setError(errorMessage);
      showError('Failed to Create Wallet', errorMessage);
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
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Wallet</h2>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter wallet name (e.g., Main Wallet, Savings)"
                  className="input-field"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Choose a descriptive name for your wallet
                </p>
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
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Create Wallet</span>
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

export default CreateWalletModal;
