import { Component, inject } from '@angular/core';
import { Api } from '../service/api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-piggy-banks',
  imports: [],
  templateUrl: './create-piggy-banks.html',
  styleUrl: './create-piggy-banks.css'
})
export class CreatePiggyBanks {
  apiService = inject(Api);
  toastr = inject(ToastrService);

  createPiggyBank(piggyBankData: any) {
    this.apiService.CreatePiggyBank(piggyBankData).subscribe({
      next: (response) => {
        this.toastr.success('Piggy bank created successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to create piggy bank: ' + error.message, 'Error');
      }
    });
  }
}
