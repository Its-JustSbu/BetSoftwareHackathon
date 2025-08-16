import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank, DollarSign } from 'lucide-react';
import { piggyBankAPI } from '../../services/api';
import { PiggyBank as PiggyBankType, PiggyBankCreate } from '../../types';
import { validateAmount } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

interface CreatePiggyBankModalProps {
  onClose: () => void;
  onPiggyBankCreated: (piggyBank: PiggyBankType) => void;
}

const CreatePiggyBankModal: React.FC<CreatePiggyBankModalProps> = ({
  onClose,
  onPiggyBankCreated,
}) => {
  const [formData, setFormData] = useState<PiggyBankCreate>({
    name: '',
    description: '',
    target_amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Piggy bank name is required';
    }

    if (!formData.target_amount.trim()) {
      newErrors.target_amount = 'Target amount is required';
    } else if (!validateAmount(formData.target_amount)) {
      newErrors.target_amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await piggyBankAPI.createPiggyBank(formData);
      onPiggyBankCreated(response.data);
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Failed to create piggy bank' });
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = ['500', '1000', '2000', '5000'];

  const handlePresetAmount = (amount: string) => {
    setFormData(prev => ({
      ...prev,
      target_amount: amount,
    }));
    if (errors.target_amount) {
      setErrors(prev => ({
        ...prev,
        target_amount: '',
      }));
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
                <PiggyBank className="w-5 h-5 text-warning-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Create Piggy Bank</h2>
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
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4"
              >
                {errors.general}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Piggy Bank Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Vacation Fund, New Car, Emergency Fund"
                  className={`input-field ${errors.name ? 'border-danger-300 focus:ring-danger-500' : ''}`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you're saving for..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="target_amount"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className={`input-field pl-10 ${errors.target_amount ? 'border-danger-300 focus:ring-danger-500' : ''}`}
                    required
                  />
                </div>
                {errors.target_amount && (
                  <p className="mt-1 text-sm text-danger-600">{errors.target_amount}</p>
                )}
              </div>

              {/* Preset Amounts */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick targets</p>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((amount) => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handlePresetAmount(amount)}
                      className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                        formData.target_amount === amount
                          ? 'border-warning-500 bg-warning-50 text-warning-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      R{amount}
                    </motion.button>
                  ))}
                </div>
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
                      <PiggyBank className="w-4 h-4" />
                      <span>Create Piggy Bank</span>
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

export default CreatePiggyBankModal;
