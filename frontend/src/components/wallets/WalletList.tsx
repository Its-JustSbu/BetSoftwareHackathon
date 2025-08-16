import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  Plus,
  Eye,
  Send,
  Download,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { walletAPI } from "../../services/api";
import { Transaction, Wallet } from "../../types";
import { formatCurrency, formatDate } from "../../utils";
import { useToast } from "../../contexts/ToastContext";
import LoadingSpinner from "../LoadingSpinner";
import CreateWalletModal from "./CreateWalletModal";
import WalletDetailsModal from "./WalletDetailsModal";
import DepositModal from "./DepositModal";
import TransferModal from "./TransferModal";

const WalletList: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getWallets();
      setWallets(response.data);
    } catch (error) {
      console.error("Error loading wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletCreated = (newWallet: Wallet) => {
    setWallets((prev) => [newWallet, ...prev]);
    setShowCreateModal(false);
  };

  const handleViewDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowDetailsModal(true);
    setActiveDropdown(null);
  };

  const handleDeposit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowDepositModal(true);
    setActiveDropdown(null);
  };

  const handleTransfer = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowTransferModal(true);
    setActiveDropdown(null);
  };

  const handleTransactionComplete = () => {
    loadWallets(); // Refresh wallet balances
    showSuccess(
      "Transaction Completed!",
      "Your transaction has been processed successfully."
    );
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

      const [walletsResponse] = await Promise.all([walletAPI.getWallets()]);

      console.log("Wallets response:", walletsResponse.data);

      // Handle both paginated and non-paginated responses
      const walletData = Array.isArray(walletsResponse.data)
        ? walletsResponse.data
        : (walletsResponse.data as any)?.results || [];

      setWallets(walletData);

      console.log("Set wallets:", walletData);

      // Load recent transactions from the first wallet if available
      if (walletData.length > 0) {
        try {
          const transactionsResponse = await walletAPI.getTransactions(
            walletData[0].id
          );
          const transactionData = Array.isArray(transactionsResponse.data)
            ? transactionsResponse.data.slice(0, 5)
            : (transactionsResponse.data as any)?.results?.slice(0, 5) || [];
          setRecentTransactions(transactionData);
          console.log("Set recent transactions:", transactionData);
        } catch (transactionError) {
          console.error("Error loading transactions:", transactionError);
          setRecentTransactions([]);
        }
      } else {
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showError(
        "Failed to Load Data",
        "Unable to load your wallet information. Please try refreshing the page."
      );
      // Set default empty arrays on error
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">My Wallets</h2>
          <p className="text-gray-600">Manage your digital wallets</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Wallet</span>
        </motion.button>
      </div>

      {/* Wallets Grid */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-200 relative"
            >
              {/* Dropdown Menu */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === wallet.id ? null : wallet.id
                    )
                  }
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {activeDropdown === wallet.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]"
                  >
                    <button
                      onClick={() => handleViewDetails(wallet)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleDeposit(wallet)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => handleTransfer(wallet)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transfer</span>
                    </button>
                    <hr className="my-2" />
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-500">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-danger-600">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Wallet Content */}
              <div className="pr-12">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(wallet.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewDetails(wallet)}
                    className="btn-secondary text-xs py-2 px-2"
                  >
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeposit(wallet)}
                    className="btn-success text-xs py-2 px-2"
                  >
                    Add Money
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTransfer(wallet)}
                    className="btn-primary text-xs py-2 px-2"
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No wallets yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first wallet to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Wallet
          </motion.button>
        </motion.div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateWalletModal
          onClose={() => setShowCreateModal(false)}
          onWalletCreated={handleWalletCreated}
        />
      )}

      {showDetailsModal && selectedWallet && (
        <WalletDetailsModal
          wallet={selectedWallet}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showDepositModal && selectedWallet && (
        <DepositModal
          wallet={selectedWallet}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleTransactionComplete}
        />
      )}

      {showTransferModal && selectedWallet && (
        <TransferModal
          wallet={selectedWallet}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransactionComplete}
        />
      )}
    </div>
  );
};

export default WalletList;
