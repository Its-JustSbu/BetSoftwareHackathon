import { Component, inject, Input, OnInit } from '@angular/core';
import { Api } from '../service/api';
import { Router } from '@angular/router';
import { Wallet } from '../models/wallet';

@Component({
  selector: 'app-check-funds',
  imports: [],
  templateUrl: './check-funds.html',
  styleUrl: './check-funds.css'
})
export class CheckFunds implements OnInit {
  wallet: Wallet = new Wallet();
  ngOnInit(): void {
    this.apiService.GetWalletById(this.walletId).subscribe({
      next: (response) => {
        this.wallet = response;
      },
      error: (error) => {
        this.router.navigate(['/wallets']);
        console.error('Error fetching wallet:', error);
      }
    })
  }
  @Input() walletId!: string;

  apiService = inject(Api);
  router = inject(Router);
}
