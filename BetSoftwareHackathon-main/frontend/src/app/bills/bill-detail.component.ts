import { Component, inject, signal, computed, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import interfaces and services
import { Bill, BillParticipant, BillStatus, PaymentMethod } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './bill-detail.component.html',
  styleUrls: ['./bill-detail.component.css']
})
export class BillDetailComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Input properties
  @Input() billId?: string;

  // State management
  bill = signal<Bill | null>(null);
  paymentMethods = signal<PaymentMethod[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  paying = signal<string | null>(null); // billId being paid
  success = signal<string | null>(null);

  // Computed values
  isBillOwner = computed(() => {
    const bill = this.bill();
    // TODO: Get current user ID from auth service
    return bill?.createdBy === 'current-user-id';
  });

  myParticipant = computed(() => {
    const bill = this.bill();
    if (!bill) return null;
    // TODO: Get current user ID from auth service
    return bill.participants.find(p => p.userId === 'current-user-id');
  });

  paidParticipants = computed(() => {
    const bill = this.bill();
    if (!bill) return [];
    return bill.participants.filter(p => p.status === 'paid');
  });

  unpaidParticipants = computed(() => {
    const bill = this.bill();
    if (!bill) return [];
    return bill.participants.filter(p => p.status !== 'paid');
  });

  billProgress = computed(() => {
    const bill = this.bill();
    if (!bill) return 0;
    const paidCount = this.paidParticipants().length;
    return Math.round((paidCount / bill.participants.length) * 100);
  });

  constructor() {}

  ngOnInit(): void {
    // Get bill ID from route if not provided as input
    if (!this.billId) {
      this.route.params.subscribe(params => {
        this.billId = params['billId'];
        this.loadBill();
        this.loadPaymentMethods();
      });
    } else {
      this.loadBill();
      this.loadPaymentMethods();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load bill details
  async loadBill(): Promise<void> {
    if (!this.billId) return;

    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.apiService.getBill(this.billId).toPromise();
      if (response?.success && response.data) {
        this.bill.set(response.data);
      }

    } catch (err) {
      console.error('Error loading bill:', err);
      this.error.set('Failed to load bill details. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Load payment methods
  async loadPaymentMethods(): Promise<void> {
    try {
      const response = await this.apiService.getPaymentMethods().toPromise();
      if (response?.success && response.data) {
        this.paymentMethods.set(response.data);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  }

  // Pay bill share
  async payBillShare(participantId: string): Promise<void> {
    if (!this.billId) return;

    try {
      this.paying.set(participantId);
      this.error.set(null);

      // Get default payment method
      const defaultMethod = this.paymentMethods().find(m => m.isDefault);
      if (!defaultMethod) {
        this.error.set('No payment method available. Please add a payment method first.');
        return;
      }

      const response = await this.apiService.payBillShare(
        this.billId,
        participantId,
        defaultMethod.id
      ).toPromise();

      if (response?.success) {
        this.success.set('Payment successful!');
        this.loadBill(); // Refresh bill data
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success.set(null);
        }, 3000);
      } else {
        this.error.set('Payment failed. Please try again.');
      }

    } catch (err) {
      console.error('Error paying bill share:', err);
      this.error.set('Payment failed. Please try again.');
    } finally {
      this.paying.set(null);
    }
  }

  // Cancel bill
  async cancelBill(): Promise<void> {
    if (!this.billId) return;

    if (!confirm('Are you sure you want to cancel this bill? This action cannot be undone.')) {
      return;
    }

    try {
      this.loading.set(true);
      const response = await this.apiService.cancelBill(this.billId).toPromise();
      
      if (response?.success) {
        this.success.set('Bill cancelled successfully!');
        this.loadBill(); // Refresh bill data
      } else {
        this.error.set('Failed to cancel bill. Please try again.');
      }

    } catch (err) {
      console.error('Error cancelling bill:', err);
      this.error.set('Failed to cancel bill. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Get bill status color
  getBillStatusColor(status: BillStatus): string {
    const colors: Record<string, string> = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'active': 'text-blue-600 bg-blue-100',
      'paid': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100',
      'overdue': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || colors['pending'];
  }

  // Get bill status icon
  getBillStatusIcon(status: BillStatus): string {
    const icons: Record<string, string> = {
      'pending': '⏳',
      'active': '📋',
      'paid': '✅',
      'cancelled': '❌',
      'overdue': '⚠️'
    };
    return icons[status] || icons['pending'];
  }

  // Get bill category icon
  getBillCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'food': '🍽️',
      'transport': '🚗',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'utilities': '⚡',
      'rent': '🏠',
      'other': '📄'
    };
    return icons[category] || icons['other'];
  }

  // Get participant status color
  getParticipantStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'paid': 'text-green-600 bg-green-100',
      'overdue': 'text-red-600 bg-red-100'
    };
    return colors[status] || colors['pending'];
  }

  // Get participant status icon
  getParticipantStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': '⏳',
      'paid': '✅',
      'overdue': '⚠️'
    };
    return icons[status] || icons['pending'];
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Check if bill is overdue
  isBillOverdue(): boolean {
    const bill = this.bill();
    if (!bill?.dueDate) return false;
    return new Date() > new Date(bill.dueDate) && bill.status !== 'paid' && bill.status !== 'cancelled';
  }

  // Check if participant can pay
  canParticipantPay(participant: BillParticipant): boolean {
    // TODO: Get current user ID from auth service
    const currentUserId = 'current-user-id';
    return participant.userId === currentUserId && participant.status !== 'paid';
  }

  // Clear messages
  clearError(): void {
    this.error.set(null);
  }

  clearSuccess(): void {
    this.success.set(null);
  }

  // Navigate back
  goBack(): void {
    this.router.navigate(['/bills']);
  }

  // Edit bill
  editBill(): void {
    if (this.billId) {
      this.router.navigate(['/bills', this.billId, 'edit']);
    }
  }

  // Share bill
  shareBill(): void {
    // TODO: Implement share functionality
    console.log('Sharing bill...');
  }

  // Export bill
  exportBill(): void {
    // TODO: Implement export functionality
    console.log('Exporting bill...');
  }

  // Refresh bill
  refreshBill(): void {
    this.loadBill();
  }

  // Handle error retry
  retry(): void {
    this.loadBill();
  }
} 