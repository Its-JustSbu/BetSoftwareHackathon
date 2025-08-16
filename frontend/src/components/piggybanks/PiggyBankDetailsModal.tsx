import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PiggyBank as PiggyBankIcon,
  Users,
  TrendingUp,
  User,
  Calendar,
} from "lucide-react";
import { piggyBankAPI } from "../../services/api";
import { PiggyBank, PiggyBankContribution, PiggyBankMember } from "../../types";
import { formatCurrency, formatDate, formatRelativeTime } from "../../utils";
import LoadingSpinner from "../LoadingSpinner";

interface PiggyBankDetailsModalProps {
  piggyBank: PiggyBank;
  onClose: () => void;
}

const PiggyBankDetailsModal: React.FC<PiggyBankDetailsModalProps> = ({
  piggyBank,
  onClose,
}) => {
  const [contributions, setContributions] = useState<PiggyBankContribution[]>(
    []
  );
  const [members, setMembers] = useState<PiggyBankMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contributions" | "members">(
    "contributions"
  );

  useEffect(() => {
    loadPiggyData();
  }, [piggyBank.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contributionsResponse, membersResponse] = await Promise.all([
        piggyBankAPI.getContributions(piggyBank.id),
        piggyBankAPI.getMembers(piggyBank.id),
      ]);
      setContributions(contributionsResponse.data);
      setMembers(membersResponse.data);
    } catch (error) {
      console.error("Error loading piggy bank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPiggyData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

      const [piggyBanksResponse, contributionsResponse] = await Promise.all([
        piggyBankAPI.getMembers(piggyBank.id),
        piggyBankAPI.getContributions(piggyBank.id),
      ]);

      console.log("PiggyBanks response:", piggyBanksResponse.data);

      // Handle both paginated and non-paginated responses
      const contributionsData = Array.isArray(contributionsResponse.data)
        ? contributionsResponse.data
        : (contributionsResponse.data as any)?.results || [];

      const piggyBankData = Array.isArray(piggyBanksResponse.data)
        ? piggyBanksResponse.data
        : (piggyBanksResponse.data as any)?.results || [];

      setMembers(piggyBankData);
      setContributions(contributionsData);

      console.log("Set piggy banks:", piggyBankData);
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
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <PiggyBankIcon className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {piggyBank.name}
                </h2>
                <p className="text-sm text-gray-500">Piggy Bank Details</p>
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
            {/* Piggy Bank Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg p-6 text-white">
                  <p className="text-warning-100 mb-2">Progress</p>
                  <p className="text-3xl font-bold mb-2">
                    {piggyBank.progress_percentage.toFixed(1)}%
                  </p>
                  <div className="w-full bg-warning-400 rounded-full h-2 mb-2">
                    <div
                      className="h-2 bg-white rounded-full"
                      style={{ width: `${piggyBank.progress_percentage}%` }}
                    />
                  </div>
                  <p className="text-warning-100 text-sm">
                    {formatCurrency(piggyBank.current_amount)} of{" "}
                    {formatCurrency(piggyBank.target_amount)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Creator</p>
                    <p className="font-medium text-gray-900">
                      {piggyBank.creator.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(piggyBank.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        piggyBank.is_target_reached
                          ? "bg-success-100 text-success-800"
                          : "bg-warning-100 text-warning-800"
                      }`}
                    >
                      {piggyBank.is_target_reached
                        ? "Goal Reached!"
                        : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>

              {piggyBank.description && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{piggyBank.description}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("contributions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "contributions"
                      ? "border-warning-500 text-warning-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Contributions ({contributions.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "members"
                      ? "border-warning-500 text-warning-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Members ({members.length})</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === "contributions" ? (
                    <motion.div
                      key="contributions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {contributions.length > 0 ? (
                        <div className="space-y-3">
                          {contributions.map((contribution) => (
                            <div
                              key={contribution.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-success-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {contribution.contributor.username}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatRelativeTime(
                                      contribution.created_at
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-success-600">
                                  +{formatCurrency(contribution.amount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  From {contribution.wallet.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No contributions yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Be the first to contribute to this piggy bank
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="members"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {members.length > 0 ? (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {member.user.username}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {member.user.email}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Joined {formatDate(member.invited_at)}
                                  </span>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                    member.is_active
                                      ? "bg-success-100 text-success-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {member.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No members yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Invite friends to join this piggy bank
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PiggyBankDetailsModal;
