import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-gray-600 rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Logout Successful
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            You have been logged out.
          </p>
        </div>

        <!-- Logout Message -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div class="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Session Ended
          </h3>
          
          <p class="text-gray-600 mb-6">
            Your session has been successfully terminated. All your data is secure and you can safely close this browser tab.
          </p>

          <!-- Login Again Button -->
          <button
            type="button"
            (click)="onLoginAgain()"
            class="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5-4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Login Again
          </button>
        </div>

        <!-- Additional Options -->
        <div class="text-center space-y-4">
          <!-- Return to Home -->
          <div>
            <a 
              routerLink="/dashboard" 
              class="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              ← Return to Dashboard
            </a>
          </div>

          <!-- Help Section -->
          <div class="border-t border-gray-200 pt-4">
            <p class="text-xs text-gray-500 mb-2">Need help?</p>
            <div class="flex justify-center space-x-4 text-xs">
              <a href="#" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                Contact Support
              </a>
              <a href="#" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                FAQ
              </a>
              <a href="#" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="text-center">
          <p class="text-xs text-gray-500">
            🔒 Your session data has been securely cleared
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LogoutComponent {
  onLoginAgain(): void {
    console.log("Logout clicked");
    // TODO: Add navigation logic when ready
    // this.router.navigate(['/auth/login']);
  }
} 