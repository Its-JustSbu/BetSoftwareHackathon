// User types
export interface User {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  created_at: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  phone_number?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

// Wallet types
export interface Wallet {
  id: string;
  owner: User;
  name: string;
  balance: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface WalletCreate {
  name: string;
}

export interface WalletDeposit {
  amount: string;
  description?: string;
}

export interface WalletTransfer {
  recipient_wallet_id: string;
  amount: string;
  description?: string;
}

// Transaction types
export type TransactionType = 
  | 'DEPOSIT' 
  | 'WITHDRAWAL' 
  | 'TRANSFER_OUT' 
  | 'TRANSFER_IN' 
  | 'PIGGYBANK_CONTRIBUTION';

export type TransactionStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface Transaction {
  id: string;
  wallet: Wallet;
  transaction_type: TransactionType;
  amount: string;
  status: TransactionStatus;
  description: string;
  reference_id?: string;
  created_at: string;
  updated_at: string;
  related_wallet?: Wallet;
  related_transaction?: string;
}

// PiggyBank types
export interface PiggyBank {
  id: string;
  name: string;
  description: string;
  creator: User;
  target_amount: string;
  current_amount: string;
  progress_percentage: number;
  is_target_reached: boolean;
  members_count: number;
  contributions_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PiggyBankCreate {
  name: string;
  description?: string;
  target_amount: string;
}

export interface PiggyBankContribution {
  id: string;
  piggy_bank: PiggyBank;
  contributor: User;
  wallet: Wallet;
  amount: string;
  transaction: Transaction;
  created_at: string;
}

export interface PiggyBankContribute {
  wallet_id: string;
  amount: string;
}

export interface PiggyBankMember {
  id: string;
  piggy_bank: PiggyBank;
  user: User;
  invited_at: string;
  joined_at?: string;
  is_active: boolean;
}

export interface AddMember {
  username: string;
}

export interface PiggyBankPayment {
  recipient_wallet_id: string;
  amount: string;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

// Dashboard stats types
export interface DashboardStats {
  totalBalance: string;
  totalWallets: number;
  totalPiggyBanks: number;
  recentTransactions: Transaction[];
}
