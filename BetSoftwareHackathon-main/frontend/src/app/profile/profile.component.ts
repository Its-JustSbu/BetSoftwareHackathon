import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import interfaces and services
import { User, Notification } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
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
  profileImage = signal<string | null>(null);

  // Forms
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // Profile sections
  activeSection = signal<'profile' | 'security' | 'preferences' | 'activity'>('profile');

  // Activity data
  recentActivity = signal<any[]>([]);
  activityLoading = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      dateOfBirth: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadRecentActivity();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load user profile
  async loadUserProfile(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // TODO: Replace with real API call
      const mockUser: User = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 (555) 123-4567',
        dateOfBirth: new Date('1990-05-15'),
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        bio: 'Software developer passionate about building great user experiences.',
        isActive: true,
        isVerified: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      };

      this.currentUser.set(mockUser);
      this.profileForm.patchValue(mockUser);

    } catch (err) {
      console.error('Error loading profile:', err);
      this.error.set('Failed to load profile. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Load recent activity
  async loadRecentActivity(): Promise<void> {
    try {
      this.activityLoading.set(true);
      
      // TODO: Replace with real API call
      const mockActivity = [
        { id: '1', type: 'login', description: 'Logged in from New York, NY', timestamp: new Date(), ip: '192.168.1.1' },
        { id: '2', type: 'bill_created', description: 'Created bill "Dinner with friends"', timestamp: new Date(Date.now() - 86400000), ip: '192.168.1.1' },
        { id: '3', type: 'payment_sent', description: 'Sent $25.00 to Jane Smith', timestamp: new Date(Date.now() - 172800000), ip: '192.168.1.1' },
        { id: '4', type: 'profile_updated', description: 'Updated profile information', timestamp: new Date(Date.now() - 259200000), ip: '192.168.1.1' }
      ];

      this.recentActivity.set(mockActivity);

    } catch (err) {
      console.error('Error loading activity:', err);
    } finally {
      this.activityLoading.set(false);
    }
  }

  // Update profile
  async updateProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.profileForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Update local user data
      if (this.currentUser()) {
        const updatedUser = { ...this.currentUser()!, ...formValue, updatedAt: new Date() };
        this.currentUser.set(updatedUser);
      }

      this.success.set('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      this.error.set('Failed to update profile. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Change password
  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.passwordForm.value;
      
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      this.success.set('Password changed successfully!');
      this.passwordForm.reset();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);

    } catch (err) {
      console.error('Error changing password:', err);
      this.error.set('Failed to change password. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // Upload profile image
  async uploadProfileImage(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // TODO: Replace with real file upload API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage.set(e.target.result);
      };
      reader.readAsDataURL(file);

      this.success.set('Profile image updated successfully!');

    } catch (err) {
      console.error('Error uploading image:', err);
      this.error.set('Failed to upload image. Please try again.');
    }
  }

  // Password match validator
  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Get activity icon
  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'login': '🔐',
      'bill_created': '📋',
      'payment_sent': '💸',
      'payment_received': '💰',
      'profile_updated': '👤',
      'default': '📝'
    };
    return icons[type] || icons['default'];
  }

  // Get activity color
  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      'login': 'text-blue-600 bg-blue-100',
      'bill_created': 'text-green-600 bg-green-100',
      'payment_sent': 'text-red-600 bg-red-100',
      'payment_received': 'text-green-600 bg-green-100',
      'profile_updated': 'text-purple-600 bg-purple-100',
      'default': 'text-gray-600 bg-gray-100'
    };
    return colors[type] || colors['default'];
  }

  // Format date
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
  setActiveSection(section: 'profile' | 'security' | 'preferences' | 'activity'): void {
    this.activeSection.set(section);
  }

  // Get form field error
  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'This field is required.';
      }
      if (field.errors?.['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters.`;
      }
      if (field.errors?.['maxlength']) {
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters.`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address.';
      }
      if (field.errors?.['pattern']) {
        return 'Please enter a valid phone number.';
      }
    }
    return null;
  }

  // Get password field error
  getPasswordFieldError(fieldName: string): string | null {
    const field = this.passwordForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'This field is required.';
      }
      if (field.errors?.['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters.`;
      }
    }
    return null;
  }

  // Check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Check if password field is invalid
  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Check if passwords match
  doPasswordsMatch(): boolean {
    return !this.passwordForm.errors?.['passwordMismatch'];
  }
}
