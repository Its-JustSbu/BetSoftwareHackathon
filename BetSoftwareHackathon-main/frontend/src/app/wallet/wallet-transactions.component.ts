import { Component, inject, signal, computed, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import interfaces and services
import { Transaction, TransactionHistoryResponse, Wallet } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-wallet-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './wallet-transactions.component.html',
  styleUrl: './wallet-transactions.component.css'
})
export class WalletTransactionsComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Input properties
  @Input() walletId?: string;

  // State management
  transactions = signal<Transaction[]>([]);
  wallet = signal<Wallet | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filter state
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');
  dateRange = signal<{ startDate?: Date; endDate?: Date }>({});

  // Computed values
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  hasPreviousPage = computed(() => this.currentPage() > 1);

  // Transaction types and statuses for filtering
  transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'payment_sent', label: 'Payment Sent' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'bill_payment', label: 'Bill Payment' },
    { value: 'refund', label: 'Refund' },
    { value: 'fee', label: 'Fee' },
    { value: 'adjustment', label: 'Adjustment' }
  ];

  transactionStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'reversed', label: 'Reversed' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Get wallet ID from route if not provided as input
    if (!this.walletId) {
      this.route.params.subscribe(params => {
        this.walletId = params['walletId'];
        this.loadWallet();
        this.loadTransactions();
      });
    } else {
      this.loadWallet();
      this.loadTransactions();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load wallet details
  async loadWallet(): Promise<void> {
    if (!this.walletId) return;

    try {
      const response = await this.apiService.getWallet(this.walletId).toPromise();
      if (response?.success && response.data) {
        this.wallet.set(response.data);
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
    }
  }

  // Load transactions
  async loadTransactions(): Promise<void> {
    if (!this.walletId) return;

    try {
      this.loading.set(true);
      this.error.set(null);

      const request = {
        walletId: this.walletId,
        page: this.currentPage(),
        limit: 20,
        type: (this.selectedType() as any) || undefined,
        status: (this.selectedStatus() as any) || undefined,
        startDate: this.dateRange().startDate,
        endDate: this.dateRange().endDate
      };

      const response = await this.apiService.getTransactions(request).toPromise();
      if (response?.success && response.data) {
        this.transactions.set(response.data.transactions);
        this.totalCount.set(response.data.totalCount);
        this.totalPages.set(Math.ceil(response.data.totalCount / 20));
      }

    } catch (err) {
      console.error('Error loading transactions:', err);
      this.error.set('Failed to load transactions. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Apply filters
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadTransactions();
  }

  // Clear filters
  clearFilters(): void {
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.dateRange.set({});
    this.currentPage.set(1);
    this.loadTransactions();
  }

  // Navigate to page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadTransactions();
    }
  }

  // Get transaction type icon
  getTransactionTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'deposit': '💰',
      'withdrawal': '💸',
      'payment_sent': '📤',
      'payment_received': '📥',
      'bill_payment': '📋',
      'refund': '↩️',
      'fee': '💳',
      'adjustment': '⚖️',
      'default': '💱'
    };
    return icons[type] || icons['default'];
  }

  // Get transaction status color
  getTransactionStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-blue-600 bg-blue-100',
      'completed': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'cancelled': 'text-gray-600 bg-gray-100',
      'reversed': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || colors['pending'];
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get transaction amount color
  getTransactionAmountColor(transaction: Transaction): string {
    if (transaction.type === 'withdrawal' || transaction.type === 'payment_sent' || transaction.type === 'fee') {
      return 'text-red-600';
    }
    if (transaction.type === 'deposit' || transaction.type === 'payment_received' || transaction.type === 'refund') {
      return 'text-green-600';
    }
    return 'text-gray-600';
  }

  // Get transaction amount prefix
  getTransactionAmountPrefix(transaction: Transaction): string {
    if (transaction.type === 'withdrawal' || transaction.type === 'payment_sent' || transaction.type === 'fee') {
      return '-';
    }
    if (transaction.type === 'deposit' || transaction.type === 'payment_received' || transaction.type === 'refund') {
      return '+';
    }
    return '';
  }

  // Export transactions
  exportTransactions(): void {
    // TODO: Implement export functionality
    console.log('Exporting transactions...');
  }

  // Refresh transactions
  refreshTransactions(): void {
    this.loadTransactions();
  }

  // Handle error retry
  retry(): void {
    this.loadTransactions();
  }

  // Navigate back to wallet list
  goBack(): void {
    this.router.navigate(['/wallets']);
  }
} 