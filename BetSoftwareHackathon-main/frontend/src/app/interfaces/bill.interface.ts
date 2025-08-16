export interface Bill {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  category: BillCategory;
  createdBy: string; // userId
  participants: BillParticipant[];
  status: BillStatus;
  dueDate?: Date;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  splitType: SplitType;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface BillParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  userProfilePicture?: string;
  amount: number;
  percentage: number;
  status: ParticipantStatus;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
}

export type BillCategory = 
  | 'food_dining'
  | 'transportation'
  | 'entertainment'
  | 'utilities'
  | 'rent_housing'
  | 'shopping'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'other';

export type BillStatus = 
  | 'draft'
  | 'active'
  | 'pending_payment'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'overdue';

export type ParticipantStatus = 
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'pending'
  | 'overdue';

export type SplitType = 
  | 'equal'
  | 'percentage'
  | 'custom_amount'
  | 'by_shares';

export type RecurringInterval = 
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export interface CreateBillRequest {
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  category: BillCategory;
  participants: CreateBillParticipant[];
  dueDate?: Date;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  splitType: SplitType;
}

export interface CreateBillParticipant {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface UpdateBillRequest {
  title?: string;
  description?: string;
  totalAmount?: number;
  category?: BillCategory;
  dueDate?: Date;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  participants?: UpdateBillParticipant[];
}

export interface UpdateBillParticipant {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
  status?: ParticipantStatus;
}

export interface BillPayment {
  id: string;
  billId: string;
  participantId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface BillSummary {
  totalBills: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  currency: string;
  billsByStatus: Record<BillStatus, number>;
  billsByCategory: Record<BillCategory, number>;
}

export interface BillSearchRequest {
  page?: number;
  limit?: number;
  status?: BillStatus;
  category?: BillCategory;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  createdBy?: string;
  participantId?: string;
}

export interface BillSearchResponse {
  bills: Bill[];
  totalCount: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BillInvitation {
  id: string;
  billId: string;
  billTitle: string;
  invitedUserId: string;
  invitedUserEmail: string;
  invitedUserName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillReminder {
  id: string;
  billId: string;
  participantId: string;
  type: 'payment_due' | 'payment_overdue' | 'bill_created' | 'payment_received';
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface BillAnalytics {
  totalBillsCreated: number;
  totalBillsParticipated: number;
  totalAmountSpent: number;
  totalAmountReceived: number;
  averageBillAmount: number;
  mostFrequentCategory: BillCategory;
  paymentOnTimePercentage: number;
  billsByMonth: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  topParticipants: Array<{
    userId: string;
    userName: string;
    totalAmount: number;
    billCount: number;
  }>;
}

export interface BillTemplate {
  id: string;
  name: string;
  description?: string;
  category: BillCategory;
  defaultAmount?: number;
  defaultCurrency: string;
  defaultSplitType: SplitType;
  defaultParticipants: string[]; // userIds
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillTemplateRequest {
  name: string;
  description?: string;
  category: BillCategory;
  defaultAmount?: number;
  defaultCurrency: string;
  defaultSplitType: SplitType;
  defaultParticipants: string[];
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  isPublic?: boolean;
} 