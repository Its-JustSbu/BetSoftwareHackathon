import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { stat } from 'fs';

export type alertStatus = 'success' | 'error' | 'warning' | 'info';

export interface alertProps {
  id: string;
  status: alertStatus;
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

const Alert: React.FC<alertProps> = ({
  id,
  status,
  title,
  message,
  onClose,
}) => {
    const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'success':
        return 'text-success-600';
      case 'error':
        return 'text-danger-600';
      case 'warning':
        return 'text-warning-600';
      case 'info':
        return 'text-blue-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getStyles()}`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

interface AlertContainerProps {
  toasts: Array<{
    id: string;
    status: alertStatus;
    title: string;
    message?: string;
  }>;
  onClose: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            id={toast.id}
            status={toast.status}
            title={toast.title}
            message={toast.message}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Alert;
