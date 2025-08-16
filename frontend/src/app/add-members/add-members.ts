import { Component, inject, Input } from '@angular/core';
import { Api } from '../service/api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-members',
  imports: [],
  templateUrl: './add-members.html',
  styleUrl: './add-members.css'
})
export class AddMembers {
  @Input() piggyBankId!: number;

  apiService = inject(Api)
  toastr = inject(ToastrService);

  addMember(memberData: any) {
    this.apiService.AddMemberToPiggyBank(this.piggyBankId, memberData).subscribe({
      next: (response) => {
        this.toastr.success('Member added successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to add member: ' + error.message, 'Error');
      }
    });
  }
}
