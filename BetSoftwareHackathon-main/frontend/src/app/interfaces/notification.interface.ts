export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
}

export type NotificationType = 
  | 'bill_created'
  | 'bill_updated'
  | 'bill_cancelled'
  | 'payment_received'
  | 'payment_sent'
  | 'payment_due'
  | 'payment_overdue'
  | 'bill_invitation'
  | 'bill_reminder'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'friend_request_rejected'
  | 'wallet_funds_added'
  | 'wallet_funds_withdrawn'
  | 'system_alert'
  | 'security_alert'
  | 'welcome'
  | 'verification_required'
  | 'password_changed'
  | 'login_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationData {
  billId?: string;
  billTitle?: string;
  amount?: number;
  currency?: string;
  participantId?: string;
  participantName?: string;
  friendId?: string;
  friendName?: string;
  walletId?: string;
  transactionId?: string;
  paymentMethod?: string;
  dueDate?: Date;
  [key: string]: any;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority?: NotificationPriority;
  expiresAt?: Date;
}

export interface UpdateNotificationRequest {
  isRead?: boolean;
  isArchived?: boolean;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  types: NotificationTypePreference[];
  quietHours: QuietHours;
  updatedAt: Date;
}

export interface NotificationTypePreference {
  type: NotificationType;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  archivedCount: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface NotificationSearchRequest {
  page?: number;
  limit?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  isArchived?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface NotificationSearchResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BulkNotificationAction {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete';
}

export interface BulkNotificationResponse {
  successCount: number;
  failedCount: number;
  errors: Array<{
    notificationId: string;
    error: string;
  }>;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  image?: string;
  action?: string;
  actionUrl?: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface EmailNotification {
  id: string;
  userId: string;
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface SMSNotification {
  id: string;
  userId: string;
  to: string;
  message: string;
  sentAt: Date;
  deliveredAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  isActive: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  maxAttempts: number;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  retryAt?: Date;
}

export interface NotificationWebhook {
  id: string;
  url: string;
  events: NotificationType[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  byChannel: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  timeSeries: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
  }>;
} 