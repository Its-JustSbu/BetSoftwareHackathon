import { Component, inject } from '@angular/core';
import { Api } from '../service/api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-wallets',
  imports: [],
  templateUrl: './create-wallets.html',
  styleUrl: './create-wallets.css'
})
export class CreateWallets {
  apiService = inject(Api);
  toastr = inject(ToastrService);

  createWallet(walletData: any) {
    this.apiService.CreateWallet(walletData).subscribe({
      next: (response) => {
        this.toastr.success('Wallet created successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to create wallet: ' + error.message, 'Error');
      }
    });
  }
}
