import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Api } from '../service/api';

@Component({
  selector: 'app-wallets',
  imports: [],
  templateUrl: './wallets.html',
  styleUrl: './wallets.css',
  standalone: true,
})
export class Wallets implements OnInit {
  ngOnInit(): void {
    this.apiService.GetWallets().subscribe({
      next: (response) => {
        this.walletsList = response;
        console.log(response);
      },
      error: (error) => {
        this.toastr.error('Failed to load wallets: ' + error.message, 'Error');
      }
    });
  }

  walletsList: any[] = [];

  apiService = inject(Api);
  toastr = inject(ToastrService);
}
