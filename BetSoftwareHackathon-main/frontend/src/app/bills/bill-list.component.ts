import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import interfaces and services
import { Bill, BillSearchResponse, BillStatus } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.css'
})
export class BillListComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // State management
  bills = signal<Bill[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filter state
  selectedStatus = signal<string>('');
  selectedCategory = signal<string>('');
  searchTerm = signal<string>('');

  // Computed values
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  hasPreviousPage = computed(() => this.currentPage() > 1);

  // Bill statuses for filtering
  billStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'overdue', label: 'Overdue' }
  ];

  // Bill categories for filtering
  billCategories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Housing' },
    { value: 'other', label: 'Other' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadBills();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load bills from API
  async loadBills(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const request = {
        page: this.currentPage(),
        limit: 20,
        status: (this.selectedStatus() as any) || undefined,
        category: (this.selectedCategory() as any) || undefined,
        searchTerm: this.searchTerm() || undefined
      };

      const response = await this.apiService.getBills(request).toPromise();
      if (response?.success && response.data) {
        this.bills.set(response.data.bills);
        this.totalCount.set(response.data.totalCount);
        this.totalPages.set(Math.ceil(response.data.totalCount / 20));
      }

    } catch (err) {
      console.error('Error loading bills:', err);
      this.error.set('Failed to load bills. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Apply filters
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadBills();
  }

  // Clear filters
  clearFilters(): void {
    this.selectedStatus.set('');
    this.selectedCategory.set('');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadBills();
  }

  // Navigate to page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadBills();
    }
  }

  // Navigate to bill detail
  viewBill(billId: string): void {
    this.router.navigate(['/bills', billId]);
  }

  // Navigate to create bill
  createBill(): void {
    this.router.navigate(['/bills', 'create']);
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

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get bill progress percentage
  getBillProgress(bill: Bill): number {
    const paidParticipants = bill.participants.filter(p => p.status === 'paid').length;
    return Math.round((paidParticipants / bill.participants.length) * 100);
  }

  // Get bill progress color
  getBillProgressColor(progress: number): string {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Get participant count text
  getParticipantCountText(bill: Bill): string {
    const count = bill.participants.length;
    return count === 1 ? '1 participant' : `${count} participants`;
  }

  // Get my share amount
  getMyShareAmount(bill: Bill): number {
    const myParticipant = bill.participants.find(p => p.userId === 'current-user-id'); // TODO: Get from auth service
    return myParticipant?.amount || 0;
  }

  // Check if bill is overdue
  isBillOverdue(bill: Bill): boolean {
    if (bill.dueDate) {
      return new Date() > new Date(bill.dueDate) && bill.status !== 'paid' && bill.status !== 'cancelled';
    }
    return false;
  }

  // Refresh bills
  refreshBills(): void {
    this.loadBills();
  }

  // Handle error retry
  retry(): void {
    this.loadBills();
  }

  // Export bills
  exportBills(): void {
    // TODO: Implement export functionality
    console.log('Exporting bills...');
  }
} 