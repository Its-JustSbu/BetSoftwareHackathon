import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-piggy-bank',
  imports: [],
  templateUrl: './piggy-bank.html',
  styleUrl: './piggy-bank.css'
})
export class PiggyBank {
  @Input() piggybank!: any;
}
