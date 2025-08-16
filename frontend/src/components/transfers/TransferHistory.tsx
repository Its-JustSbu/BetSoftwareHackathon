import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import { walletAPI } from "../../services/api";
import { Wallet, Transaction } from "../../types";
import {
  formatCurrency,
  formatDate,
  formatTransactionType,
  getTransactionTypeColor,
} from "../../utils";
import LoadingSpinner from "../LoadingSpinner";

const TransferHistory: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    loadTransactionsData()
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [allTransactions, searchTerm, selectedWallet, selectedType]);

  const loadTransactionsData = async () => {
    try {
      setLoading(true);
      console.log("Loading Transactions data...");

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
          const walletsResponse = await walletAPI.getTransactions(
            walletData[0].id
          );

          const transactionPromises = walletsResponse.data.map((wallet) =>
            walletAPI.getTransactions(wallet.id)
          );

          const transactionResponses = await Promise.all(transactionPromises);
          const allTxns = transactionResponses.flatMap(
            (response) => response.data
          );

          // Sort by date (newest first)
          allTxns.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          setAllTransactions(allTxns);
        } catch (transactionError) {
          console.error("Error loading transactions:", transactionError);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set default empty arrays on error
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = allTransactions;

    // Filter by wallet
    if (selectedWallet !== "all") {
      filtered = filtered.filter((txn) => txn.wallet.id === selectedWallet);
    }

    // Filter by transaction type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (txn) => txn.transaction_type === selectedType
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (txn) =>
          txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatTransactionType(txn.transaction_type)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const transferTypes = [
    { value: "all", label: "All Types" },
    { value: "TRANSFER_IN", label: "Transfers In" },
    { value: "TRANSFER_OUT", label: "Transfers Out" },
    { value: "DEPOSIT", label: "Deposits" },
    { value: "PIGGYBANK_CONTRIBUTION", label: "Piggy Bank Contributions" },
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
          <h2 className="text-2xl font-bold text-gray-900">Transfer History</h2>
          <p className="text-gray-600">View all your transaction history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Wallet Filter */}
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="input-field"
          >
            <option value="all">All Wallets</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            {transferTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Transactions ({filteredTransactions.length})
              </h3>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === "DEPOSIT" ||
                        transaction.transaction_type === "TRANSFER_IN"
                          ? "bg-success-100"
                          : "bg-danger-100"
                      }`}
                    >
                      {transaction.transaction_type === "DEPOSIT" ||
                      transaction.transaction_type === "TRANSFER_IN" ? (
                        <ArrowDownRight className="w-6 h-6 text-success-600" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-danger-600" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {formatTransactionType(transaction.transaction_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.wallet.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${getTransactionTypeColor(
                        transaction.transaction_type
                      )}`}
                    >
                      {transaction.transaction_type === "DEPOSIT" ||
                      transaction.transaction_type === "TRANSFER_IN"
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "COMPLETED"
                          ? "bg-success-100 text-success-700"
                          : transaction.status === "PENDING"
                          ? "bg-warning-100 text-warning-700"
                          : "bg-danger-100 text-danger-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedWallet !== "all" || selectedType !== "all"
                ? "Try adjusting your filters"
                : "Start making transactions to see them here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferHistory;
