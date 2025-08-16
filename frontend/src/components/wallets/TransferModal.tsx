import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, DollarSign, User, IdCard } from "lucide-react";
import { walletAPI } from "../../services/api";
import { Wallet, WalletTransfer } from "../../types";
import { formatCurrency, validateAmount } from "../../utils";
import { useToast } from "../../contexts/ToastContext";
import LoadingSpinner from "../LoadingSpinner";

interface TransferModalProps {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  wallet,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<WalletTransfer>({
    recipient_wallet_id: "",
    amount: "",
    description: "",
  });
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as string,
    }));
    console.log(formData);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount(formData.amount)) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (parseFloat(formData.amount) > parseFloat(wallet.balance)) {
      setError("Insufficient balance for this transfer");
      return;
    }

    if (!formData.recipient_wallet_id) {
      setError("Please select a recipient wallet");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(formData);
      setLoading(true);
      console.log("Tranfering Money...");

      const [walletsResponse] = await Promise.all([walletAPI.transfer(wallet.id, formData)]);

      console.log("Wallets response:", walletsResponse.data);

      const recipientWallet = availableWallets.find(
        (w) => w.id === formData.recipient_wallet_id
      );
      showSuccess(
        "Money Sent!",
        `${formatCurrency(formData.amount)} has been sent to ${
          recipientWallet?.name || "recipient"
        }.`
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error loading transfer data:", error);
      showError(
        "Failed to Load Data",
        "Unable to Transfer money. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
    }
    // try {
    //   await walletAPI.transfer(wallet.id, formData);
    //   const recipientWallet = availableWallets.find(
    //     (w) => w.id === formData.recipient_wallet_id
    //   );
    //   showSuccess(
    //     "Money Sent!",
    //     `${formatCurrency(formData.amount)} has been sent to ${
    //       recipientWallet?.name || "recipient"
    //     }.`
    //   );
    //   onSuccess();
    //   onClose();
    // } catch (err: any) {
    //   const errorMessage =
    //     err.response?.data?.message || "Failed to transfer money";
    //   setError(errorMessage);
    //   showError("Transfer Failed", errorMessage);
    // } finally {
    //   setLoading(false);
    // }
  };

  const selectedRecipient = availableWallets.find(
    (w) => w.id === formData.recipient_wallet_id
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full h-full max-w-md overflow-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Transfer Money
                </h2>
                <p className="text-sm text-gray-500">From {wallet.name}</p>
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
              <p className="text-sm text-gray-600 mb-1">Available Balance</p>
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
                <label
                  htmlFor="rid"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Receipient ID
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="rid"
                    name="recipient_wallet_id" // <-- change here
                    value={formData.recipient_wallet_id}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {selectedRecipient && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        {selectedRecipient.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        Owner: {selectedRecipient.owner.username}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                    max={wallet.balance}
                    className="input-field pl-10"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum: {formatCurrency(wallet.balance)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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

              {/* Preview */}
              {formData.amount && validateAmount(formData.amount) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-50 border border-primary-200 rounded-lg p-4"
                >
                  <p className="text-sm text-primary-700 mb-2">
                    Transfer Preview
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary-600">Amount:</span>
                      <span className="font-semibold text-primary-700">
                        {formatCurrency(formData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary-600">
                        Remaining Balance:
                      </span>
                      <span className="font-semibold text-primary-700">
                        {formatCurrency(
                          parseFloat(wallet.balance) -
                            parseFloat(formData.amount)
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
                  disabled={
                    loading ||
                    !validateAmount(formData.amount) ||
                    !formData.recipient_wallet_id
                  }
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        Transfer{" "}
                        {formData.amount && formatCurrency(formData.amount)}
                      </span>
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

export default TransferModal;
