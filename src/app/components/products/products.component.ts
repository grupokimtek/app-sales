import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Product, ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  failedImages = new Set<number>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';
    this.productsService.list().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: products => {
        this.products = products;
        this.failedImages.clear();
      },
      error: () => { this.error = 'No se pudieron cargar los productos. Intenta nuevamente.'; }
    });
  }

  trackProduct(_index: number, product: Product): number {
    return product.id;
  }

  markImageUnavailable(productId: number): void {
    this.failedImages.add(productId);
  }
}
