import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank as PiggyBankIcon,
  Plus,
  Users,
  Target,
  TrendingUp,
  MoreVertical,
  Eye,
  UserPlus,
  DollarSign,
} from 'lucide-react';
import { piggyBankAPI } from '../../services/api';
import { PiggyBank } from '../../types';
import { formatCurrency, formatDate, calculateProgress } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import CreatePiggyBankModal from './CreatePiggyBankModal';
import PiggyBankDetailsModal from './PiggyBankDetailsModal';
import ContributeModal from './ContributeModal';

const PiggyBankList: React.FC = () => {
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<PiggyBank | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadPiggyData();
  }, []);

  const loadPiggyBanks = async () => {
    try {
      setLoading(true);
      const response = await piggyBankAPI.getPiggyBanks();
      setPiggyBanks(response.data);
    } catch (error) {
      console.error('Error loading piggy banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePiggyBankCreated = (newPiggyBank: PiggyBank) => {
    setPiggyBanks(prev => [newPiggyBank, ...prev]);
    setShowCreateModal(false);
  };

  const handleViewDetails = (piggyBank: PiggyBank) => {
    setSelectedPiggyBank(piggyBank);
    setShowDetailsModal(true);
    setActiveDropdown(null);
  };

  const handleContribute = (piggyBank: PiggyBank) => {
    setSelectedPiggyBank(piggyBank);
    setShowContributeModal(true);
    setActiveDropdown(null);
  };

  const handleContributionComplete = () => {
    loadPiggyBanks(); // Refresh piggy bank amounts
  };

    const loadPiggyData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');

      const [piggyBanksResponse] = await Promise.all([
        piggyBankAPI.getPiggyBanks(),
      ]);

      console.log('PiggyBanks response:', piggyBanksResponse.data);

      // Handle both paginated and non-paginated responses
      const piggyBankData = Array.isArray(piggyBanksResponse.data)
        ? piggyBanksResponse.data
        : ((piggyBanksResponse.data as any)?.results || []);

      setPiggyBanks(piggyBankData);

      console.log('Set piggy banks:', piggyBankData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setPiggyBanks([]);
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
          <h2 className="text-2xl font-bold text-gray-900">Piggy Banks</h2>
          <p className="text-gray-600">Save together and reach your goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Piggy Bank</span>
        </motion.button>
      </div>

      {/* Piggy Banks Grid */}
      {piggyBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {piggyBanks.map((piggyBank, index) => (
            <motion.div
              key={piggyBank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-200 relative"
            >
              {/* Dropdown Menu */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === piggyBank.id ? null : piggyBank.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {activeDropdown === piggyBank.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]"
                  >
                    <button
                      onClick={() => handleViewDetails(piggyBank)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleContribute(piggyBank)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Contribute</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-500">
                      <UserPlus className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Piggy Bank Content */}
              <div className="pr-12">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                    <PiggyBankIcon className="w-6 h-6 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{piggyBank.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(piggyBank.created_at)}
                    </p>
                  </div>
                </div>

                {piggyBank.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {piggyBank.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {piggyBank.progress_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${piggyBank.progress_percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        piggyBank.is_target_reached 
                          ? 'bg-success-500' 
                          : 'bg-warning-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Amount Info */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Current</span>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(piggyBank.current_amount)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(piggyBank.target_amount)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{piggyBank.members_count} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{piggyBank.contributions_count} contributions</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewDetails(piggyBank)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContribute(piggyBank)}
                    className="flex-1 btn-primary text-sm py-2"
                    disabled={piggyBank.is_target_reached}
                  >
                    {piggyBank.is_target_reached ? 'Complete!' : 'Contribute'}
                  </motion.button>
                </div>

                {/* Target Reached Badge */}
                {piggyBank.is_target_reached && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 left-2"
                  >
                    <div className="bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Goal Reached!</span>
                    </div>
                  </motion.div>
                )}
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
            <PiggyBankIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No piggy banks yet</h3>
          <p className="text-gray-500 mb-6">Create your first piggy bank to start saving together</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Piggy Bank
          </motion.button>
        </motion.div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePiggyBankModal
          onClose={() => setShowCreateModal(false)}
          onPiggyBankCreated={handlePiggyBankCreated}
        />
      )}

      {showDetailsModal && selectedPiggyBank && (
        <PiggyBankDetailsModal
          piggyBank={selectedPiggyBank}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showContributeModal && selectedPiggyBank && (
        <ContributeModal
          piggyBank={selectedPiggyBank}
          onClose={() => setShowContributeModal(false)}
          onSuccess={handleContributionComplete}
        />
      )}
    </div>
  );
};

export default PiggyBankList;
