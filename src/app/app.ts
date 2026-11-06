/* import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-ventas');
}
 */




/* import { Component } from '@angular/core';
import { Products } from './pages/products/products';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Products],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
} */










import { Component } from '@angular/core';
import { Products } from './pages/products/products';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Products],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

}