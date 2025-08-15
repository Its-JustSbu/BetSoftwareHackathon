import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBar } from "./components/navigation-bar/navigation-bar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  protected title = 'frontend';
}
