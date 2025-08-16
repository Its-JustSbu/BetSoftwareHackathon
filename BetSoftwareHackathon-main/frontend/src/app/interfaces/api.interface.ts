// Generic API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
  };
}

// HTTP Request/Response Interfaces
export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
}

// Authentication API Interfaces
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// File Upload Interfaces
export interface FileUploadRequest {
  file: File;
  type: 'profile_picture' | 'bill_receipt' | 'document';
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Search and Filter Interfaces
export interface SearchRequest {
  query: string;
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse<T> {
  results: T[];
  totalCount: number;
  query: string;
  suggestions?: string[];
  meta: ApiMeta;
}

// WebSocket Interfaces
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  id?: string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  connectedAt: Date;
  lastActivityAt: Date;
}

// Real-time Notification Interfaces
export interface RealTimeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationType = 
  | 'bill_created'
  | 'bill_updated'
  | 'payment_received'
  | 'payment_due'
  | 'payment_overdue'
  | 'friend_request'
  | 'bill_invitation'
  | 'system_alert';

// Error Handling Interfaces
export interface ApiException {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: string[];
}

// Rate Limiting Interfaces
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Health Check Interfaces
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    external: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}

// Analytics and Reporting Interfaces
export interface AnalyticsRequest {
  startDate: Date;
  endDate: Date;
  metrics: string[];
  groupBy?: string;
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
  summary: Record<string, number>;
  generatedAt: Date;
}

// Export/Import Interfaces
export interface ExportRequest {
  type: 'bills' | 'transactions' | 'users' | 'analytics';
  format: 'csv' | 'json' | 'pdf';
  filters?: Record<string, any>;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ExportResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Bulk Operations Interfaces
export interface BulkOperationRequest<T> {
  operations: Array<{
    action: 'create' | 'update' | 'delete';
    data: T;
    id?: string;
  }>;
}

export interface BulkOperationResponse {
  results: Array<{
    id?: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Cache Interfaces
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[];
}

export interface CacheResponse<T> {
  data: T;
  cached: boolean;
  cachedAt?: Date;
  expiresAt?: Date;
} 