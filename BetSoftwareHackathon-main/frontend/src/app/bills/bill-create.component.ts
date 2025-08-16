import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Import interfaces and services
import { CreateBillRequest, CreateBillParticipant, BillCategory, SplitType } from '../interfaces';
import { ApiService } from '../service/api';

@Component({
  selector: 'app-bill-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './bill-create.component.html',
  styleUrl: './bill-create.component.css'
})
export class BillCreateComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State management
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form
  billForm: FormGroup;

  // Bill categories
  billCategories = [
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'transport', label: 'Transportation', icon: '🚗' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'rent', label: 'Rent & Housing', icon: '🏠' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  // Split types
  splitTypes = [
    { value: 'equal', label: 'Split Equally', icon: '⚖️' },
    { value: 'percentage', label: 'Split by Percentage', icon: '📊' },
    { value: 'custom', label: 'Custom Amounts', icon: '✏️' }
  ];

  // Computed values
  totalAmount = computed(() => {
    const amount = this.billForm.get('totalAmount')?.value || 0;
    return parseFloat(amount);
  });

  participantCount = computed(() => {
    return this.participantsArray.length;
  });

  splitAmount = computed(() => {
    const total = this.totalAmount();
    const count = this.participantCount();
    if (count > 0) {
      return total / count;
    }
    return 0;
  });

  get participantsArray(): FormArray {
    return this.billForm.get('participants') as FormArray;
  }

  constructor() {
    this.billForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      totalAmount: ['', [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      currency: ['USD', Validators.required],
      category: ['other', Validators.required],
      splitType: ['equal', Validators.required],
      dueDate: [''],
      participants: this.fb.array([])
    });

    // Add initial participant (current user)
    this.addParticipant();
  }

  ngOnInit(): void {
    // Watch for changes in total amount and split type to update participant amounts
    this.billForm.get('totalAmount')?.valueChanges.subscribe(() => {
      this.updateParticipantAmounts();
    });

    this.billForm.get('splitType')?.valueChanges.subscribe(() => {
      this.updateParticipantAmounts();
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Add participant
  addParticipant(): void {
    const participant = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.participantsArray.push(participant);
    this.updateParticipantAmounts();
  }

  // Remove participant
  removeParticipant(index: number): void {
    if (this.participantsArray.length > 1) {
      this.participantsArray.removeAt(index);
      this.updateParticipantAmounts();
    }
  }

  // Update participant amounts based on split type
  updateParticipantAmounts(): void {
    const total = this.totalAmount();
    const count = this.participantCount();
    const splitType = this.billForm.get('splitType')?.value;

    if (count === 0 || total === 0) return;

    switch (splitType) {
      case 'equal':
        const equalAmount = total / count;
        this.participantsArray.controls.forEach(control => {
          control.patchValue({ amount: equalAmount, percentage: (100 / count) });
        });
        break;

      case 'percentage':
        // Keep existing percentages, update amounts
        this.participantsArray.controls.forEach(control => {
          const percentage = control.get('percentage')?.value || 0;
          const amount = (total * percentage) / 100;
          control.patchValue({ amount });
        });
        break;

      case 'custom':
        // Keep existing amounts, update percentages
        this.participantsArray.controls.forEach(control => {
          const amount = control.get('amount')?.value || 0;
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          control.patchValue({ percentage });
        });
        break;
    }
  }

  // Validate total amounts
  validateTotalAmounts(): boolean {
    const total = this.totalAmount();
    const participantTotal = this.participantsArray.controls.reduce((sum, control) => {
      return sum + (control.get('amount')?.value || 0);
    }, 0);

    return Math.abs(total - participantTotal) < 0.01; // Allow for small rounding differences
  }

  // Submit form
  async onSubmit(): Promise<void> {
    if (this.billForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.validateTotalAmounts()) {
      this.error.set('Total participant amounts must equal the bill total.');
      return;
    }

    try {
      this.submitting.set(true);
      this.error.set(null);
      this.success.set(null);

      const formValue = this.billForm.value;
      
      const participants: CreateBillParticipant[] = this.participantsArray.controls.map(control => ({
        email: control.get('email')?.value,
        name: control.get('name')?.value,
        amount: parseFloat(control.get('amount')?.value),
        percentage: parseFloat(control.get('percentage')?.value)
      }));

      const request: CreateBillRequest = {
        title: formValue.title,
        description: formValue.description,
        totalAmount: parseFloat(formValue.totalAmount),
        currency: formValue.currency,
        category: formValue.category,
        splitType: formValue.splitType,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        participants: participants
      };

      const response = await this.apiService.createBill(request).toPromise();
      
      if (response?.success && response.data) {
        this.success.set('Bill created successfully! Redirecting to bill details...');
        
        // Redirect to bill details after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/bills', response.data.id]);
        }, 2000);
      } else {
        this.error.set('Failed to create bill. Please try again.');
      }

    } catch (err) {
      console.error('Error creating bill:', err);
      this.error.set('Failed to create bill. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  // Mark all form controls as touched
  markFormGroupTouched(): void {
    Object.keys(this.billForm.controls).forEach(key => {
      const control = this.billForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Get form field error
  getFieldError(fieldName: string): string | null {
    const field = this.billForm.get(fieldName);
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
      if (field.errors?.['min']) {
        return `Minimum value is ${field.errors['min'].min}.`;
      }
      if (field.errors?.['max']) {
        return `Maximum value is ${field.errors['max'].max}.`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address.';
      }
    }
    return null;
  }

  // Get participant field error
  getParticipantFieldError(index: number, fieldName: string): string | null {
    const participant = this.participantsArray.at(index);
    const field = participant.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'This field is required.';
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address.';
      }
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
    const field = this.billForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Check if participant field is invalid
  isParticipantFieldInvalid(index: number, fieldName: string): boolean {
    const participant = this.participantsArray.at(index);
    const field = participant.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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

  // Get category icon
  getCategoryIcon(category: string): string {
    const found = this.billCategories.find(c => c.value === category);
    return found?.icon || '📄';
  }

  // Get split type icon
  getSplitTypeIcon(splitType: string): string {
    const found = this.splitTypes.find(s => s.value === splitType);
    return found?.icon || '⚖️';
  }
} 