import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import interfaces and services
import { User, Notification } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State management
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // User data
  currentUser = signal<User | null>(null);

  // Forms
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  securityForm: FormGroup;
  billingForm: FormGroup;

  // Settings sections
  activeSection = signal<'notifications' | 'privacy' | 'security' | 'billing' | 'advanced'>('notifications');

  // Settings data
  notificationSettings = signal({
    email: true,
    push: true,
    sms: false,
    billReminders: true,
    paymentConfirmations: true,
    securityAlerts: true,
    marketing: false,
    weeklyReports: true
  });

  privacySettings = signal({
    profileVisible: true,
    showBalance: false,
    showActivity: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataSharing: false
  });

  securitySettings = signal({
    twoFactorAuth: false,
    biometricLogin: true,
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });

  constructor() {
    this.notificationForm = this.fb.group({
      email: [true],
      push: [true],
      sms: [false],
      billReminders: [true],
      paymentConfirmations: [true],
      securityAlerts: [true],
      marketing: [false],
      weeklyReports: [true]
    });

    this.privacyForm = this.fb.group({
      profileVisible: [true],
      showBalance: [false],
      showActivity: [true],
      allowFriendRequests: [true],
      showOnlineStatus: [true],
      dataSharing: [false]
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [false],
      biometricLogin: [true],
      sessionTimeout: [30],
      loginNotifications: [true],
      suspiciousActivityAlerts: [true]
    });

    this.billingForm = this.fb.group({
      autoRecharge: [false],
      rechargeAmount: [100, [Validators.min(10), Validators.max(10000)]],
      lowBalanceAlert: [true],
      alertThreshold: [50, [Validators.min(1), Validators.max(1000)]],
      monthlyReports: [true],
      taxDocuments: [true]
    });
  }

  ngOnInit(): void {
    this.loadUserSettings();
    this.initializeForms();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load user settings
  async loadUserSettings(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // TODO: Replace with real API call
      const mockUser: User = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isVerified: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      };

      this.currentUser.set(mockUser);

    } catch (err) {
      console.error('Error loading settings:', err);
      this.error.set('Failed to load settings. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Initialize forms with current settings
  initializeForms(): void {
    this.notificationForm.patchValue(this.notificationSettings());
    this.privacyForm.patchValue(this.privacySettings());
    this.securityForm.patchValue(this.securitySettings());
    this.billingForm.patchValue({
      autoRecharge: false,
      rechargeAmount: 100,
      lowBalanceAlert: true,
      alertThreshold: 50,
      monthlyReports: true,
      taxDocuments: true
    });
  }

  // Save notification settings
  async saveNotificationSettings(): Promise<void> {
    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.notificationForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.notificationSettings.set(formValue);
      this.success.set('Notification settings updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating notification settings:', err);
      this.error.set('Failed to update notification settings. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Save privacy settings
  async savePrivacySettings(): Promise<void> {
    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.privacyForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.privacySettings.set(formValue);
      this.success.set('Privacy settings updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating privacy settings:', err);
      this.error.set('Failed to update privacy settings. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Save security settings
  async saveSecuritySettings(): Promise<void> {
    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.securityForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.securitySettings.set(formValue);
      this.success.set('Security settings updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating security settings:', err);
      this.error.set('Failed to update security settings. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Save billing settings
  async saveBillingSettings(): Promise<void> {
    if (this.billingForm.invalid) return;

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.billingForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.success.set('Billing settings updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating billing settings:', err);
      this.error.set('Failed to update billing settings. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Toggle two-factor authentication
  async toggleTwoFactorAuth(): Promise<void> {
    try {
      this.saving.set(true);
      const currentValue = this.securityForm.get('twoFactorAuth')?.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.securityForm.patchValue({ twoFactorAuth: !currentValue });
      this.success.set(`Two-factor authentication ${!currentValue ? 'enabled' : 'disabled'} successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error toggling 2FA:', err);
      this.error.set('Failed to update two-factor authentication. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Export user data
  async exportUserData(): Promise<void> {
    try {
      this.saving.set(true);
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      this.success.set('Data export started! You will receive an email when it\'s ready.');

      // Clear success message after 5 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 5000);

    } catch (err) {
      console.error('Error exporting data:', err);
      this.error.set('Failed to export data. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    try {
      this.saving.set(true);
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      this.success.set('Account deletion request submitted. You will receive a confirmation email.');

      // Clear success message after 5 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 5000);

    } catch (err) {
      console.error('Error deleting account:', err);
      this.error.set('Failed to delete account. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Get session timeout options
  getSessionTimeoutOptions(): Array<{value: number, label: string}> {
    return [
      { value: 15, label: '15 minutes' },
      { value: 30, label: '30 minutes' },
      { value: 60, label: '1 hour' },
      { value: 120, label: '2 hours' },
      { value: 240, label: '4 hours' },
      { value: 480, label: '8 hours' }
    ];
  }

  // Get recharge amount options
  getRechargeAmountOptions(): Array<{value: number, label: string}> {
    return [
      { value: 50, label: '$50' },
      { value: 100, label: '$100' },
      { value: 200, label: '$200' },
      { value: 500, label: '$500' },
      { value: 1000, label: '$1,000' }
    ];
  }

  // Get alert threshold options
  getAlertThresholdOptions(): Array<{value: number, label: string}> {
    return [
      { value: 25, label: '$25' },
      { value: 50, label: '$50' },
      { value: 100, label: '$100' },
      { value: 200, label: '$200' },
      { value: 500, label: '$500' }
    ];
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
    this.router.navigate(['/dashboard']);
  }

  // Set active section
  setActiveSection(section: 'notifications' | 'privacy' | 'security' | 'billing' | 'advanced'): void {
    this.activeSection.set(section);
  }

  // Get form field error
  getFieldError(fieldName: string): string | null {
    const field = this.billingForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['min']) {
        return `Minimum value is ${field.errors['min'].min}.`;
      }
      if (field.errors?.['max']) {
        return `Maximum value is ${field.errors['max'].max}.`;
      }
    }
    return null;
  }

  // Check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.billingForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
