import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBar } from "./components/navigation-bar/navigation-bar";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements OnInit {
  toastr = inject(ToastrService);
  ngOnInit(): void {
    this.toastr.error('This is a test error message', 'Error');
  }
  protected title = 'frontend';
}
