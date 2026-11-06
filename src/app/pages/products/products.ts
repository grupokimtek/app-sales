/* import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  private productService = inject(ProductService);

  products: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.loading = false;
        console.log('Productos recibidos:', response);
      },
      error: (err) => {
        console.error('Error al consultar productos:', err);
        this.error = 'No se pudieron cargar los productos.';
        this.loading = false;
      }
    });
  }
} */

  
/* import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts().subscribe({
      next: (response) => {

        console.log('Respuesta de Laravel:', response);

        this.products = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Error HTTP:', err);

        this.error = err.status === 0
          ? 'No se pudo conectar con Laravel.'
          : `Error ${err.status}: ${err.message}`;

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
 */





import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts().subscribe({
      next: (response) => {

        console.log('Respuesta de Laravel:', response);

        this.products = Array.isArray(response)
          ? response
          : response.data ?? [];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Error HTTP:', err);

        this.error = err.status === 0
          ? 'No se pudo conectar con Laravel.'
          : `Error ${err.status}: ${err.message}`;

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
