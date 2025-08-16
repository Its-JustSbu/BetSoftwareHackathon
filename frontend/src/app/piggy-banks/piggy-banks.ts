import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Api } from '../service/api';

@Component({
  selector: 'app-piggy-banks',
  imports: [],
  templateUrl: './piggy-banks.html',
  styleUrl: './piggy-banks.css'
})
export class PiggyBanks implements OnInit {
  piggyBanksList: any[] = [];

  apiService = inject(Api);
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.apiService.GetPiggyBanks().subscribe({
      next: (response) => {
        this.piggyBanksList = response;
      },
      error: (error) => {
        this.toastr.error('Failed to load piggy banks: ' + error.message, 'Error');
      }
    });
  }
}
