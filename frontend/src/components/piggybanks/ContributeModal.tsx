import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, PiggyBank as PiggyBankIcon, Wallet } from 'lucide-react';
import { piggyBankAPI, walletAPI } from '../../services/api';
import { PiggyBank, PiggyBankContribute, Wallet as WalletType } from '../../types';
import { formatCurrency, validateAmount } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

interface ContributeModalProps {
  piggyBank: PiggyBank;
  onClose: () => void;
  onSuccess: () => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({
  piggyBank,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PiggyBankContribute>({
    wallet_id: '',
    amount: '',
  });
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWalletData();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.wallet_id) {
      setError('Please select a wallet');
      return;
    }

    const selectedWallet = wallets.find(w => w.id === formData.wallet_id);
    if (selectedWallet && parseFloat(formData.amount) > parseFloat(selectedWallet.balance)) {
      setError('Insufficient balance in selected wallet');
      return;
    }

    // Check if contribution would exceed target
    const remainingAmount = parseFloat(piggyBank.target_amount) - parseFloat(piggyBank.current_amount);
    if (parseFloat(formData.amount) > remainingAmount) {
      setError(`Maximum contribution is ${formatCurrency(remainingAmount.toString())}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await piggyBankAPI.contribute(piggyBank.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to contribute to piggy bank');
    } finally {
      setLoading(false);
    }
  };

  const selectedWallet = wallets.find(w => w.id === formData.wallet_id);
  const remainingAmount = parseFloat(piggyBank.target_amount) - parseFloat(piggyBank.current_amount);
  const maxContribution = selectedWallet 
    ? Math.min(parseFloat(selectedWallet.balance), remainingAmount)
    : remainingAmount;

  const presetAmounts = ['50', '100', '200', '500'].filter(amount => 
    parseFloat(amount) <= maxContribution
  );

  const handlePresetAmount = (amount: string) => {
    setFormData(prev => ({
      ...prev,
      amount,
    }));
  };

    const loadWalletData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');

      const [walletsResponse] = await Promise.all([
        walletAPI.getWallets(),
      ]);

      console.log('Wallets response:', walletsResponse.data);

      // Handle both paginated and non-paginated responses
      const walletData = Array.isArray(walletsResponse.data)
        ? walletsResponse.data
        : ((walletsResponse.data as any)?.results || []);

      setWallets(walletData);

      console.log('Set wallets:', walletData);

      // Load recent transactions from the first wallet if available
      if (walletData.length > 0) {
        try {
          const transactionsResponse = await walletAPI.getTransactions(walletData[0].id);
          const transactionData = Array.isArray(transactionsResponse.data)
            ? transactionsResponse.data.slice(0, 5)
            : ((transactionsResponse.data as any)?.results?.slice(0, 5) || []);
          console.log('Set recent transactions:', transactionData);
        } catch (transactionError) {
          console.error('Error loading transactions:', transactionError);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default empty arrays on error
      setWallets([]);
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
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <PiggyBankIcon className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Contribute</h2>
                <p className="text-sm text-gray-500">{piggyBank.name}</p>
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
            {/* Piggy Bank Progress */}
            <div className="bg-warning-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-warning-700">Progress</span>
                <span className="text-sm font-medium text-warning-800">
                  {piggyBank.progress_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-warning-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 bg-warning-500 rounded-full"
                  style={{ width: `${piggyBank.progress_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warning-700">
                  {formatCurrency(piggyBank.current_amount)}
                </span>
                <span className="text-warning-700">
                  {formatCurrency(piggyBank.target_amount)}
                </span>
              </div>
              <p className="text-sm text-warning-600 mt-2">
                {formatCurrency(remainingAmount.toString())} remaining to reach goal
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
                <label htmlFor="wallet_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Wallet
                </label>
                {loadingWallets ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : wallets.length > 0 ? (
                  <select
                    id="wallet_id"
                    name="wallet_id"
                    value={formData.wallet_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No active wallets available
                  </div>
                )}
              </div>

              {selectedWallet && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{selectedWallet.name}</p>
                      <p className="text-sm text-blue-700">
                        Available: {formatCurrency(selectedWallet.balance)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount
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
                    max={maxContribution}
                    className="input-field pl-10"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum: {formatCurrency(maxContribution.toString())}
                </p>
              </div>

              {/* Preset Amounts */}
              {presetAmounts.length > 0 && (
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
                            ? 'border-warning-500 bg-warning-50 text-warning-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        R{amount}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {formData.amount && validateAmount(formData.amount) && selectedWallet && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-success-50 border border-success-200 rounded-lg p-4"
                >
                  <p className="text-sm text-success-700 mb-2">Contribution Preview</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-success-600">New Progress:</span>
                      <span className="font-semibold text-success-700">
                        {(((parseFloat(piggyBank.current_amount) + parseFloat(formData.amount)) / parseFloat(piggyBank.target_amount)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-success-600">Wallet Balance After:</span>
                      <span className="font-semibold text-success-700">
                        {formatCurrency(
                          (parseFloat(selectedWallet.balance) - parseFloat(formData.amount)).toString()
                        )}
                      </span>
                    </div>
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
                  disabled={loading || !validateAmount(formData.amount) || !formData.wallet_id || wallets.length === 0}
                  className="flex-1 btn-success flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <PiggyBankIcon className="w-4 h-4" />
                      <span>Contribute {formData.amount && formatCurrency(formData.amount)}</span>
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

export default ContributeModal;
