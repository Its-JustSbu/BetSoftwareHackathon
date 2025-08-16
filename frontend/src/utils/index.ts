// Currency formatting
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Relative time formatting
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDateShort(dateString);
  }
};

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Progress calculation
export const calculateProgress = (current: string, target: string): number => {
  const currentAmount = parseFloat(current);
  const targetAmount = parseFloat(target);
  
  if (targetAmount === 0) return 0;
  
  return Math.min((currentAmount / targetAmount) * 100, 100);
};

// Transaction type formatting
export const formatTransactionType = (type: string): string => {
  switch (type) {
    case 'DEPOSIT':
      return 'Deposit';
    case 'WITHDRAWAL':
      return 'Withdrawal';
    case 'TRANSFER_OUT':
      return 'Transfer Out';
    case 'TRANSFER_IN':
      return 'Transfer In';
    case 'PIGGYBANK_CONTRIBUTION':
      return 'Piggy Bank Contribution';
    default:
      return type;
  }
};

// Transaction status formatting
export const formatTransactionStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

// Get transaction status color
export const getTransactionStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'text-success-600 bg-success-100';
    case 'PENDING':
      return 'text-warning-600 bg-warning-100';
    case 'FAILED':
      return 'text-danger-600 bg-danger-100';
    case 'CANCELLED':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Get transaction type color
export const getTransactionTypeColor = (type: string): string => {
  switch (type) {
    case 'DEPOSIT':
    case 'TRANSFER_IN':
      return 'text-success-600';
    case 'WITHDRAWAL':
    case 'TRANSFER_OUT':
    case 'PIGGYBANK_CONTRIBUTION':
      return 'text-danger-600';
    default:
      return 'text-gray-600';
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate random color for avatars
export const generateAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
