import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import interfaces
import { Notification, User } from '../../interfaces';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navigation-bar.html',
  styleUrls: ['./navigation-bar.css']
})
export class NavigationBar implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  // State management
  isMenuOpen = signal(false);
  isProfileDropdownOpen = signal(false);
  isNotificationsDropdownOpen = signal(false);

  // Mock data (replace with real service calls)
  currentUser = signal<User | null>({
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  notifications = signal<Notification[]>([
    {
      id: '1',
      userId: '1',
      type: 'bill_created',
      title: 'New Bill Created',
      message: 'Dinner bill has been created',
      priority: 'normal',
      isRead: false,
      isArchived: false,
      createdAt: new Date()
    },
    {
      id: '2',
      userId: '1',
      type: 'payment_received',
      title: 'Payment Received',
      message: 'You received $25.00 from Jane',
      priority: 'high',
      isRead: false,
      isArchived: false,
      createdAt: new Date()
    }
  ]);

  // Computed values
  isAuthenticated = computed(() => !!this.currentUser());
  unreadNotificationsCount = computed(() => 
    this.notifications().filter(n => !n.isRead).length
  );

  // Navigation items
  navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/wallets', label: 'Wallets', icon: '💰' },
    { path: '/bills', label: 'Bills', icon: '📋' }
  ];

  constructor() {
    // Close dropdowns when clicking outside
    this.setupClickOutsideListeners();
  }

  ngOnInit(): void {
    // Initialize component
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    // Cleanup listeners
    this.removeClickOutsideListeners();
  }

  // Toggle mobile menu
  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  // Toggle profile dropdown
  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update(open => !open);
    if (this.isProfileDropdownOpen()) {
      this.isNotificationsDropdownOpen.set(false);
    }
  }

  // Toggle notifications dropdown
  toggleNotificationsDropdown(): void {
    this.isNotificationsDropdownOpen.update(open => !open);
    if (this.isNotificationsDropdownOpen()) {
      this.isProfileDropdownOpen.set(false);
    }
  }

  // Close all dropdowns
  closeDropdowns(): void {
    this.isMenuOpen.set(false);
    this.isProfileDropdownOpen.set(false);
    this.isNotificationsDropdownOpen.set(false);
  }

  // Handle navigation
  navigateTo(path: string): void {
    this.closeDropdowns();
    this.router.navigate([path]);
  }

  // Handle logout
  logout(): void {
    // TODO: Implement logout logic
    console.log('Logging out...');
    this.currentUser.set(null);
    this.closeDropdowns();
    this.router.navigate(['/login']);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    // TODO: Implement API call
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(): void {
    // TODO: Implement API call
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, isRead: true }))
    );
  }

  // Load notifications (mock data)
  private loadNotifications(): void {
    // TODO: Replace with real API call
    console.log('Loading notifications...');
  }

  // Setup click outside listeners
  private setupClickOutsideListeners(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  // Remove click outside listeners
  private removeClickOutsideListeners(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  // Handle clicks outside dropdowns
  private handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close dropdowns if clicking outside
    if (!target.closest('.dropdown-container')) {
      this.isProfileDropdownOpen.set(false);
      this.isNotificationsDropdownOpen.set(false);
    }
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'bill_created': '📋',
      'payment_received': '💰',
      'payment_sent': '💸',
      'bill_invitation': '📨',
      'friend_request': '👥',
      'system_alert': '⚠️',
      'default': '🔔'
    };
    return icons[type] || icons['default'];
  }

  // Get notification priority color
  getNotificationPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'low': 'text-gray-500',
      'normal': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };
    return colors[priority] || colors['normal'];
  }

  // Get user initials
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // Get full name
  getFullName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }
}
