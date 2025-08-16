import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

// Import interfaces
import {
  // User interfaces
  User,
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  UserSearchResult,
  FriendRequest,
  UserStats,
  
  // Wallet interfaces
  Wallet,
  WalletBalance,
  CreateWalletRequest,
  UpdateWalletRequest,
  AddFundsRequest,
  WithdrawFundsRequest,
  Transaction,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  WalletStats as WalletStatsInterface,
  TransferFundsRequest,
  WalletSummary,
  PaymentMethod,
  PaymentMethodRequest,
  PaymentMethodResponse,
  BankAccount,
  BankAccountRequest,
  BankAccountResponse,
  
  // Bill interfaces
  Bill,
  BillParticipant,
  CreateBillRequest,
  UpdateBillRequest,
  BillPayment,
  BillSummary,
  BillSearchRequest,
  BillSearchResponse,
  BillInvitation,
  BillReminder,
  BillAnalytics,
  BillTemplate,
  CreateBillTemplateRequest,
  
  // API interfaces
  ApiResponse,
  PaginatedResponse,
  AuthToken,
  RefreshTokenRequest,
  RefreshTokenResponse,
  FileUploadRequest,
  FileUploadResponse,
  SearchRequest,
  SearchResponse,
  
  // Notification interfaces
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationPreferences,
  NotificationStats,
  NotificationSearchRequest,
  NotificationSearchResponse,
  BulkNotificationAction,
  BulkNotificationResponse
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  
  // Auth token management
  private authTokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public authToken$ = this.authTokenSubject.asObservable();

  // Headers management
  private getHeaders(): HttpHeaders {
    const token = this.authTokenSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Token storage methods
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeStoredToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      // Handle specific error cases
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.logout();
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 422) {
        errorMessage = 'Validation error. Please check your input.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================================================
  // WALLET MANAGEMENT
  // ============================================================================

  getWallets(): Observable<ApiResponse<Wallet[]>> {
    return this.http.get<ApiResponse<Wallet[]>>(`${this.baseUrl}wallets`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this)),
      shareReplay(1)
    );
  }

  getWallet(walletId: string): Observable<ApiResponse<Wallet>> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}wallets/${walletId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createWallet(wallet: CreateWalletRequest): Observable<ApiResponse<Wallet>> {
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}wallets`, wallet, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateWallet(walletId: string, wallet: UpdateWalletRequest): Observable<ApiResponse<Wallet>> {
    return this.http.put<ApiResponse<Wallet>>(`${this.baseUrl}wallets/${walletId}`, wallet, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteWallet(walletId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}wallets/${walletId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getWalletBalance(walletId: string): Observable<ApiResponse<WalletBalance>> {
    return this.http.get<ApiResponse<WalletBalance>>(`${this.baseUrl}wallets/${walletId}/balance`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addFunds(request: AddFundsRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}wallets/${request.walletId}/add-funds`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  withdrawFunds(request: WithdrawFundsRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}wallets/${request.walletId}/withdraw`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  transferFunds(request: TransferFundsRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}wallets/transfer`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTransactions(request: TransactionHistoryRequest): Observable<ApiResponse<TransactionHistoryResponse>> {
    let params = new HttpParams()
      .set('page', request.page?.toString() || '1')
      .set('limit', request.limit?.toString() || '20');
    
    if (request.startDate) {
      params = params.set('startDate', request.startDate.toISOString());
    }
    if (request.endDate) {
      params = params.set('endDate', request.endDate.toISOString());
    }
    if (request.type) {
      params = params.set('type', request.type);
    }
    if (request.status) {
      params = params.set('status', request.status);
    }

    return this.http.get<ApiResponse<TransactionHistoryResponse>>(`${this.baseUrl}wallets/${request.walletId}/transactions`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getWalletStats(walletId: string): Observable<ApiResponse<WalletStatsInterface>> {
    return this.http.get<ApiResponse<WalletStatsInterface>>(`${this.baseUrl}wallets/${walletId}/stats`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getWalletSummary(): Observable<ApiResponse<WalletSummary>> {
    return this.http.get<ApiResponse<WalletSummary>>(`${this.baseUrl}wallets/summary`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Payment Methods
  getPaymentMethods(): Observable<ApiResponse<PaymentMethod[]>> {
    return this.http.get<ApiResponse<PaymentMethod[]>>(`${this.baseUrl}payment-methods`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addPaymentMethod(request: PaymentMethodRequest): Observable<ApiResponse<PaymentMethodResponse>> {
    return this.http.post<ApiResponse<PaymentMethodResponse>>(`${this.baseUrl}payment-methods`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Bank Accounts
  getBankAccounts(): Observable<ApiResponse<BankAccount[]>> {
    return this.http.get<ApiResponse<BankAccount[]>>(`${this.baseUrl}bank-accounts`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addBankAccount(request: BankAccountRequest): Observable<ApiResponse<BankAccountResponse>> {
    return this.http.post<ApiResponse<BankAccountResponse>>(`${this.baseUrl}bank-accounts`, request, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ============================================================================
  // BILL MANAGEMENT
  // ============================================================================

  getBills(request?: BillSearchRequest): Observable<ApiResponse<BillSearchResponse>> {
    let params = new HttpParams();
    
    if (request) {
      if (request.page) params = params.set('page', request.page.toString());
      if (request.limit) params = params.set('limit', request.limit.toString());
      if (request.status) params = params.set('status', request.status);
      if (request.category) params = params.set('category', request.category);
      if (request.startDate) params = params.set('startDate', request.startDate.toISOString());
      if (request.endDate) params = params.set('endDate', request.endDate.toISOString());
      if (request.minAmount) params = params.set('minAmount', request.minAmount.toString());
      if (request.maxAmount) params = params.set('maxAmount', request.maxAmount.toString());
      if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
      if (request.createdBy) params = params.set('createdBy', request.createdBy);
      if (request.participantId) params = params.set('participantId', request.participantId);
    }

    return this.http.get<ApiResponse<BillSearchResponse>>(`${this.baseUrl}bills`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getBill(billId: string): Observable<ApiResponse<Bill>> {
    return this.http.get<ApiResponse<Bill>>(`${this.baseUrl}bills/${billId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createBill(bill: CreateBillRequest): Observable<ApiResponse<Bill>> {
    return this.http.post<ApiResponse<Bill>>(`${this.baseUrl}bills`, bill, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateBill(billId: string, bill: UpdateBillRequest): Observable<ApiResponse<Bill>> {
    return this.http.put<ApiResponse<Bill>>(`${this.baseUrl}bills/${billId}`, bill, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteBill(billId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}bills/${billId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cancelBill(billId: string): Observable<ApiResponse<Bill>> {
    return this.http.post<ApiResponse<Bill>>(`${this.baseUrl}bills/${billId}/cancel`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  payBillShare(billId: string, participantId: string, paymentMethod: string): Observable<ApiResponse<BillPayment>> {
    return this.http.post<ApiResponse<BillPayment>>(`${this.baseUrl}bills/${billId}/pay`, {
      participantId,
      paymentMethod
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getBillSummary(): Observable<ApiResponse<BillSummary>> {
    return this.http.get<ApiResponse<BillSummary>>(`${this.baseUrl}bills/summary`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getBillAnalytics(): Observable<ApiResponse<BillAnalytics>> {
    return this.http.get<ApiResponse<BillAnalytics>>(`${this.baseUrl}bills/analytics`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Bill Invitations
  getBillInvitations(): Observable<ApiResponse<BillInvitation[]>> {
    return this.http.get<ApiResponse<BillInvitation[]>>(`${this.baseUrl}bills/invitations`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  respondToBillInvitation(invitationId: string, response: 'accepted' | 'declined'): Observable<ApiResponse<BillInvitation>> {
    return this.http.post<ApiResponse<BillInvitation>>(`${this.baseUrl}bills/invitations/${invitationId}/respond`, {
      response
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Bill Templates
  getBillTemplates(): Observable<ApiResponse<BillTemplate[]>> {
    return this.http.get<ApiResponse<BillTemplate[]>>(`${this.baseUrl}bills/templates`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createBillTemplate(template: CreateBillTemplateRequest): Observable<ApiResponse<BillTemplate>> {
    return this.http.post<ApiResponse<BillTemplate>>(`${this.baseUrl}bills/templates`, template, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  getNotifications(request?: NotificationSearchRequest): Observable<ApiResponse<NotificationSearchResponse>> {
    let params = new HttpParams();
    
    if (request) {
      if (request.page) params = params.set('page', request.page.toString());
      if (request.limit) params = params.set('limit', request.limit.toString());
      if (request.type) params = params.set('type', request.type);
      if (request.priority) params = params.set('priority', request.priority);
      if (request.isRead !== undefined) params = params.set('isRead', request.isRead.toString());
      if (request.isArchived !== undefined) params = params.set('isArchived', request.isArchived.toString());
      if (request.startDate) params = params.set('startDate', request.startDate.toISOString());
      if (request.endDate) params = params.set('endDate', request.endDate.toISOString());
      if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    }

    return this.http.get<ApiResponse<NotificationSearchResponse>>(`${this.baseUrl}notifications`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getNotification(notificationId: string): Observable<ApiResponse<Notification>> {
    return this.http.get<ApiResponse<Notification>>(`${this.baseUrl}notifications/${notificationId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  markNotificationAsRead(notificationId: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.baseUrl}notifications/${notificationId}`, {
      isRead: true
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  markNotificationAsUnread(notificationId: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.baseUrl}notifications/${notificationId}`, {
      isRead: false
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  archiveNotification(notificationId: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.baseUrl}notifications/${notificationId}`, {
      isArchived: true
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteNotification(notificationId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}notifications/${notificationId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  bulkNotificationAction(action: BulkNotificationAction): Observable<ApiResponse<BulkNotificationResponse>> {
    return this.http.post<ApiResponse<BulkNotificationResponse>>(`${this.baseUrl}notifications/bulk-action`, action, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getNotificationStats(): Observable<ApiResponse<NotificationStats>> {
    return this.http.get<ApiResponse<NotificationStats>>(`${this.baseUrl}notifications/stats`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getNotificationPreferences(): Observable<ApiResponse<NotificationPreferences>> {
    return this.http.get<ApiResponse<NotificationPreferences>>(`${this.baseUrl}notifications/preferences`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Observable<ApiResponse<NotificationPreferences>> {
    return this.http.put<ApiResponse<NotificationPreferences>>(`${this.baseUrl}notifications/preferences`, preferences, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // File upload
  uploadFile(request: FileUploadRequest): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);
    
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    return this.http.post<ApiResponse<FileUploadResponse>>(`${this.baseUrl}upload`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authTokenSubject.value}`
      })
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Search functionality
  search<T>(request: SearchRequest): Observable<ApiResponse<SearchResponse<T>>> {
    let params = new HttpParams()
      .set('query', request.query);
    
    if (request.page) params = params.set('page', request.page.toString());
    if (request.limit) params = params.set('limit', request.limit.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortOrder) params = params.set('sortOrder', request.sortOrder);
    
    if (request.filters && typeof request.filters === 'object') {
      Object.keys(request.filters).forEach(key => {
        const value = request.filters![key];
        if (value !== undefined && value !== null) {
          params = params.set(`filters[${key}]`, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<SearchResponse<T>>>(`${this.baseUrl}search`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Health check
  healthCheck(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}health`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Logout method (for future use)
  logout(): void {
    this.removeStoredToken();
    this.authTokenSubject.next(null);
    // Additional logout logic can be added here
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authTokenSubject.value;
  }
}
