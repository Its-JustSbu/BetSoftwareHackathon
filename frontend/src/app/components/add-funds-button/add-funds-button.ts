import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Api } from '../../service/api';

@Component({
  selector: 'app-add-funds-button',
  imports: [],
  templateUrl: './add-funds-button.html',
  styleUrl: './add-funds-button.css'
})
export class AddFundsButton {
  apiService = inject(Api);
  toastr = inject(ToastrService);

  addFunds(walletId: number, amount: number) {
    this.apiService.AddFundsToWallet(walletId, amount).subscribe({
      next: (response) => {
        this.toastr.success('Funds added successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to add funds: ' + error.message, 'Error');
      }
    });
  }
}
