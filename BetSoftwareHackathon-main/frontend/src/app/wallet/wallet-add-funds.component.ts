import { Component, inject, signal, computed, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import interfaces and services
import { AddFundsRequest, Transaction, Wallet, PaymentMethod } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-wallet-add-funds',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './wallet-add-funds.component.html',
  styleUrls: ['./wallet-add-funds.component.css']
})
export class WalletAddFundsComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // Input properties
  @Input() walletId?: string;

  // State management
  wallet = signal<Wallet | null>(null);
  paymentMethods = signal<PaymentMethod[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form
  addFundsForm: FormGroup;

  // Computed values
  selectedPaymentMethod = computed(() => {
    const methodId = this.addFundsForm.get('paymentMethodId')?.value;
    return this.paymentMethods().find(m => m.id === methodId);
  });

  constructor() {
    this.addFundsForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      paymentMethodId: ['', Validators.required],
      description: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    // Get wallet ID from route if not provided as input
    if (!this.walletId) {
      this.route.params.subscribe(params => {
        this.walletId = params['walletId'];
        this.loadWallet();
        this.loadPaymentMethods();
      });
    } else {
      this.loadWallet();
      this.loadPaymentMethods();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load wallet details
  async loadWallet(): Promise<void> {
    if (!this.walletId) return;

    try {
      this.loading.set(true);
      const response = await this.apiService.getWallet(this.walletId).toPromise();
      if (response?.success && response.data) {
        this.wallet.set(response.data);
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
      this.error.set('Failed to load wallet details.');
    } finally {
      this.loading.set(false);
    }
  }

  // Helper method for parseFloat in templates
  parseFloatValue(value: any): number {
    return parseFloat(value) || 0;
  }

  // Load payment methods
  async loadPaymentMethods(): Promise<void> {
    try {
      const response = await this.apiService.getPaymentMethods().toPromise();
      if (response?.success && response.data) {
        this.paymentMethods.set(response.data);
        
        // Set default payment method if available
        const defaultMethod = response.data.find(m => m.isDefault);
        if (defaultMethod) {
          this.addFundsForm.patchValue({ paymentMethodId: defaultMethod.id });
        }
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
      this.error.set('Failed to load payment methods.');
    }
  }

  // Submit form
  async onSubmit(): Promise<void> {
    if (this.addFundsForm.invalid || !this.walletId) return;

    try {
      this.submitting.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.addFundsForm.value;
      const selectedMethod = this.selectedPaymentMethod();

      if (!selectedMethod) {
        this.error.set('Please select a payment method.');
        return;
      }

      const request: AddFundsRequest = {
        walletId: this.walletId,
        amount: parseFloat(formValue.amount),
        paymentMethod: selectedMethod,
        description: formValue.description || 'Add funds'
      };

      const response = await this.apiService.addFunds(request).toPromise();
      
      if (response?.success && response.data) {
        this.success.set(`Successfully added ${this.formatCurrency(request.amount)} to your wallet!`);
        this.addFundsForm.reset();
        
        // Reset to default payment method
        const defaultMethod = this.paymentMethods().find(m => m.isDefault);
        if (defaultMethod) {
          this.addFundsForm.patchValue({ paymentMethodId: defaultMethod.id });
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.success.set(null);
        }, 5000);
      } else {
        this.error.set('Failed to add funds. Please try again.');
      }

    } catch (err) {
      console.error('Error adding funds:', err);
      this.error.set('Failed to add funds. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get payment method display name
  getPaymentMethodDisplayName(method: PaymentMethod): string {
    if (method.lastFourDigits) {
      return `${method.name} •••• ${method.lastFourDigits}`;
    }
    return method.name;
  }

  // Get payment method icon
  getPaymentMethodIcon(method: PaymentMethod): string {
    const icons: Record<string, string> = {
      'card': '💳',
      'bank_transfer': '🏦',
      'mobile_money': '📱',
      'crypto': '₿',
      'default': '💰'
    };
    return icons[method.type] || icons['default'];
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
    this.router.navigate(['/wallets']);
  }

  // Add new payment method
  addPaymentMethod(): void {
    this.router.navigate(['/payment-methods', 'add']);
  }

  // Get form field error
  getFieldError(fieldName: string): string | null {
    const field = this.addFundsForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'This field is required.';
      }
      if (field.errors?.['min']) {
        return `Minimum amount is ${field.errors['min'].min}.`;
      }
      if (field.errors?.['max']) {
        return `Maximum amount is ${field.errors['max'].max}.`;
      }
      if (field.errors?.['maxlength']) {
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters.`;
      }
    }
    return null;
  }

  // Check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addFundsForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
} 