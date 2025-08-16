import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBar } from "./components/navigation-bar/navigation-bar";
import { ToastrService } from 'ngx-toastr';
import { Api } from './service/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements OnInit {
  toastr = inject(ToastrService);
  apiService = inject(Api);

  ngOnInit(): void {
    this.apiService.login('alice', 'securepass123').subscribe({
      next: (response) => {
        const cookieHeader = response.headers;
        console.log('Set-Cookie header:', cookieHeader);
        this.toastr.success('Logged in successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Login failed: ' + error.message, 'Error');
      }
    })
  }

  protected title = 'frontend';
}
