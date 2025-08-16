import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import interfaces and services
import { Wallet, WalletSummary } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.css']
})
export class WalletListComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // State management
  wallets = signal<Wallet[]>([]);
  walletSummary = signal<WalletSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed values
  totalBalance = computed(() => {
    const summary = this.walletSummary();
    return summary?.totalBalance || 0;
  });

  totalWallets = computed(() => {
    const summary = this.walletSummary();
    return summary?.totalWallets || 0;
  });

  primaryCurrency = computed(() => {
    const summary = this.walletSummary();
    return summary?.primaryCurrency || 'USD';
  });

  constructor() {}

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load wallets from API
  async loadWallets(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Load wallet summary
      const summaryResponse = await this.apiService.getWalletSummary().toPromise();
      if (summaryResponse?.success && summaryResponse.data) {
        this.walletSummary.set(summaryResponse.data);
        this.wallets.set(summaryResponse.data.wallets);
      }

      // Load individual wallets if needed
      const walletsResponse = await this.apiService.getWallets().toPromise();
      if (walletsResponse?.success && walletsResponse.data) {
        this.wallets.set(walletsResponse.data);
      }

    } catch (err) {
      console.error('Error loading wallets:', err);
      this.error.set('Failed to load wallets. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Navigate to wallet transactions
  viewTransactions(walletId: string): void {
    this.router.navigate(['/wallet', walletId, 'transactions']);
  }

  // Navigate to add funds
  addFunds(walletId: string): void {
    this.router.navigate(['/wallet', walletId, 'add-funds']);
  }

  // Navigate to create new wallet
  createWallet(): void {
    this.router.navigate(['/wallet', 'create']);
  }

  // Refresh wallets
  refreshWallets(): void {
    this.loadWallets();
  }

  // Helper method for wallet status in templates
  getWalletStatusSafe(wallet: any) {
    return this.getWalletStatus(wallet);
  }

  // Get wallet type icon
  getWalletTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'primary': '🏦',
      'savings': '💰',
      'business': '💼',
      'travel': '✈️',
      'default': '💳'
    };
    return icons[type] || icons['default'];
  }

  // Get wallet type color
  getWalletTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'primary': 'bg-blue-100 text-blue-800',
      'savings': 'bg-green-100 text-green-800',
      'business': 'bg-purple-100 text-purple-800',
      'travel': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['default'];
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get wallet status
  getWalletStatus(wallet: Wallet): { text: string; color: string } {
    if (!wallet.isActive) {
      return { text: 'Inactive', color: 'text-red-600 bg-red-100' };
    }
    if (wallet.balance < 0) {
      return { text: 'Overdrawn', color: 'text-red-600 bg-red-100' };
    }
    if (wallet.balance === 0) {
      return { text: 'Empty', color: 'text-yellow-600 bg-yellow-100' };
    }
    return { text: 'Active', color: 'text-green-600 bg-green-100' };
  }

  // Handle error retry
  retry(): void {
    this.loadWallets();
  }
} 