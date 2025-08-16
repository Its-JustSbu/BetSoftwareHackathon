export interface Wallet {
  id: string;
  userId: string;
  name: string;
  currency: string;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTransactionAt?: Date;
}

export interface WalletBalance {
  walletId: string;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  lastUpdated: Date;
}

export interface CreateWalletRequest {
  name: string;
  currency: string;
  initialBalance?: number;
  isDefault?: boolean;
}

export interface UpdateWalletRequest {
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AddFundsRequest {
  walletId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface WithdrawFundsRequest {
  walletId: string;
  amount: number;
  bankAccount: BankAccount;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'mobile_money' | 'crypto';
  name: string;
  lastFourDigits?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  reference: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'payment_sent'
  | 'payment_received'
  | 'bill_payment'
  | 'refund'
  | 'fee'
  | 'adjustment';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export interface TransactionHistoryRequest {
  walletId: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WalletStats {
  walletId: string;
  totalTransactions: number;
  totalInflow: number;
  totalOutflow: number;
  averageTransactionAmount: number;
  mostFrequentTransactionType: TransactionType;
  lastTransactionDate?: Date;
}

export interface TransferFundsRequest {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
}

export interface WalletSummary {
  totalWallets: number;
  totalBalance: number;
  primaryCurrency: string;
  wallets: Wallet[];
  recentTransactions: Transaction[];
}

export interface PaymentMethodRequest {
  type: PaymentMethod['type'];
  name: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  isDefault?: boolean;
}

export interface PaymentMethodResponse extends PaymentMethod {
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccountRequest {
  accountNumber: string;
  accountName: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
  isDefault?: boolean;
}

export interface BankAccountResponse extends BankAccount {
  createdAt: Date;
  updatedAt: Date;
} 