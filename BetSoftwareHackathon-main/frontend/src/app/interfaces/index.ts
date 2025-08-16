// User Interfaces
export * from './user.interface';

// Wallet Interfaces
export * from './wallet.interface';

// Bill Interfaces
export * from './bill.interface';

// API Interfaces
export * from './api.interface';

// Notification Interfaces
export * from './notification.interface';

// Common Types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'ZAR';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';

export type Timezone = 'UTC' | 'America/New_York' | 'America/Los_Angeles' | 'Europe/London' | 'Europe/Paris' | 'Asia/Tokyo' | 'Asia/Shanghai' | 'Australia/Sydney';

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

// UI Component Types
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => string;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  expandable?: boolean;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

// Event Types
export interface AppEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  source?: string;
}

export interface EventHandler<T = any> {
  (event: AppEvent<T>): void;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingConfig {
  state: LoadingState;
  message?: string;
  error?: string;
  retry?: () => void;
}

// Modal Types
export interface ModalConfig {
  title: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  showCloseButton?: boolean;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: () => void;
  }>;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    action: () => void;
  };
}

// File Types
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// Search Types
export interface SearchResult<T = any> {
  id: string;
  title: string;
  description?: string;
  type: string;
  data: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchFilters {
  [key: string]: string | number | boolean | string[] | number[];
}

// Pagination Types
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Types
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'numberRange' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

// Sort Types
export interface SortConfig {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

// Export all common types for easy access
export type {
  User,
  UserProfile,
  Address,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  UserSearchResult,
  FriendRequest,
  UserStats
} from './user.interface';

export type {
  Wallet,
  WalletBalance,
  CreateWalletRequest,
  UpdateWalletRequest,
  AddFundsRequest,
  WithdrawFundsRequest,
  PaymentMethod,
  BankAccount,
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  WalletStats,
  TransferFundsRequest,
  WalletSummary,
  PaymentMethodRequest,
  PaymentMethodResponse,
  BankAccountRequest,
  BankAccountResponse
} from './wallet.interface';

export type {
  Bill,
  BillParticipant,
  BillCategory,
  BillStatus,
  ParticipantStatus,
  SplitType,
  RecurringInterval,
  CreateBillRequest,
  CreateBillParticipant,
  UpdateBillRequest,
  UpdateBillParticipant,
  BillPayment,
  PaymentStatus,
  BillSummary,
  BillSearchRequest,
  BillSearchResponse,
  BillInvitation,
  BillReminder,
  BillAnalytics,
  BillTemplate,
  CreateBillTemplateRequest
} from './bill.interface';

export type {
  ApiResponse,
  ApiError,
  ApiMeta,
  PaginatedResponse,
  HttpRequestConfig,
  HttpResponse,
  AuthToken,
  RefreshTokenRequest,
  RefreshTokenResponse,
  FileUploadRequest,
  FileUploadResponse,
  SearchRequest,
  SearchResponse,
  WebSocketMessage,
  WebSocketConnection,
  RealTimeNotification,
  NotificationType as ApiNotificationType,
  ApiException,
  ValidationError,
  RateLimitInfo,
  HealthCheckResponse,
  ServiceStatus,
  AnalyticsRequest,
  AnalyticsResponse,
  ExportRequest,
  ExportResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  CacheConfig,
  CacheResponse
} from './api.interface';

export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationData,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationPreferences,
  NotificationTypePreference,
  QuietHours,
  NotificationTemplate,
  NotificationStats,
  NotificationSearchRequest,
  NotificationSearchResponse,
  BulkNotificationAction,
  BulkNotificationResponse,
  PushNotification,
  EmailNotification,
  SMSNotification,
  NotificationChannel,
  NotificationDelivery,
  NotificationWebhook,
  NotificationAnalytics
} from './notification.interface'; 