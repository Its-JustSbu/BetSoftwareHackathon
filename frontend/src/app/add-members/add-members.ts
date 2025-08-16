import { Component, inject, Input } from '@angular/core';
import { Api } from '../service/api';
import { ToastrService } from 'ngx-toastr';
import { member, members } from '../models/piggybank';

@Component({
  selector: 'app-add-members',
  imports: [],
  templateUrl: './add-members.html',
  styleUrl: './add-members.css'
})
export class AddMembers {
  @Input() piggyBankId!: string;

  apiService = inject(Api)
  toastr = inject(ToastrService);

  addMember(memberData: members) {
    this.apiService.AddMemberToPiggyBank(this.piggyBankId, memberData.id).subscribe({
      next: (response) => {
        this.toastr.success('Member added successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to add member: ' + error.message, 'Error');
      }
    });
  }
}
