import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { NotifyService } from '../../services/notify.service';
import { ProductService } from '../../services/product.service';
import { SaleService } from '../../services/sale.service';

interface CartLine {
  product: Product;
  quantity: number;
  discount_percent: number;
}

const MAX_DISCOUNT = 10;

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss']
})
export class SaleFormComponent implements OnInit {
  /** Usuario estático definido por la prueba. */
  private readonly userId = 1;

  readonly maxDiscount = MAX_DISCOUNT;
  products: Product[] = [];
  cart: CartLine[] = [];
  loading = true;
  saving = false;

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private notify: NotifyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  inCart(product: Product): boolean {
    return this.cart.some((l) => l.product.id === product.id);
  }

  add(product: Product): void {
    if (!this.inCart(product)) {
      this.cart.push({ product, quantity: 1, discount_percent: 0 });
    }
  }

  remove(line: CartLine): void {
    this.cart = this.cart.filter((l) => l !== line);
  }

  subtotal(line: CartLine): number {
    return line.product.price * (Number(line.quantity) || 0);
  }

  discountAmount(line: CartLine): number {
    return this.subtotal(line) * ((Number(line.discount_percent) || 0) / 100);
  }

  lineTotal(line: CartLine): number {
    return this.subtotal(line) - this.discountAmount(line);
  }

  get totalDiscount(): number {
    return this.cart.reduce((sum, l) => sum + this.discountAmount(l), 0);
  }

  get total(): number {
    return this.cart.reduce((sum, l) => sum + this.lineTotal(l), 0);
  }

  /** Devuelve el primer problema del carrito o null si es válido. */
  get cartError(): string | null {
    if (!this.cart.length) {
      return 'Agrega al menos un producto.';
    }
    for (const l of this.cart) {
      const qty = Number(l.quantity);
      const discount = Number(l.discount_percent);
      if (!Number.isInteger(qty) || qty <= 0) {
        return `La cantidad de "${l.product.name}" debe ser un entero mayor que cero.`;
      }
      if (qty > l.product.stock) {
        return `Stock insuficiente para "${l.product.name}" (disponible: ${l.product.stock}).`;
      }
      if (isNaN(discount) || discount < 0 || discount > MAX_DISCOUNT) {
        return `El descuento de "${l.product.name}" debe estar entre 0 y ${MAX_DISCOUNT}.`;
      }
    }
    return null;
  }

  submit(): void {
    if (this.cartError || this.saving) {
      return;
    }

    this.saving = true;
    this.saleService
      .create({
        user_id: this.userId,
        items: this.cart.map((l) => ({
          product_id: l.product.id,
          quantity: Number(l.quantity),
          discount_percent: Number(l.discount_percent) || 0
        }))
      })
      .subscribe({
        next: (res) => {
          this.notify.success(`${res.message} (#${res.sale_id})`);
          this.router.navigate(['/ventas']);
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          this.notify.httpError(err);
        }
      });
  }
}
