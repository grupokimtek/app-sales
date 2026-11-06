import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Product, ProductsService } from '../../services/products.service';
import { CreatedSale, SalesService } from '../../services/sales.service';

interface SaleLine {
  product: Product;
  quantity: FormControl<number | null>;
  discount: FormControl<number | null>;
}

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html'
})
export class SaleFormComponent implements OnInit {
  @Output() readonly created = new EventEmitter<CreatedSale>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly search = new FormControl('', { nonNullable: true });
  products: Product[] = [];
  lines: SaleLine[] = [];
  loading = false;
  loadError = false;
  saving = false;
  error = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly productsService: ProductsService, private readonly salesService: SalesService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.loadError = false;
    this.productsService.list().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: products => { this.products = products; },
      error: () => { this.loadError = true; }
    });
  }

  get filteredProducts(): Product[] {
    const query = this.normalize(this.search.value.trim());
    return this.products.filter(product => this.normalize(product.name).includes(query) || `#${product.id}`.includes(query));
  }

  get estimatedTotal(): number {
    return this.lines.reduce((total, line) => total + this.lineCents(line) - this.discountCents(line), 0) / 100;
  }

  get estimatedDiscount(): number {
    return this.lines.reduce((total, line) => total + this.discountCents(line), 0) / 100;
  }

  get canSubmit(): boolean {
    return !this.saving && this.lines.length > 0 && this.lines.every(line => line.quantity.valid && line.discount.valid);
  }

  isAdded(product: Product): boolean {
    return this.lines.some(line => line.product.id === product.id);
  }

  addProduct(product: Product): void {
    if (this.saving || product.stock < 1 || this.isAdded(product)) return;

    this.lines.push({
      product,
      quantity: new FormControl<number | null>(1, this.quantityValidators(product.stock)),
      discount: new FormControl<number | null>(null, [Validators.min(0), Validators.max(10), Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    });
    this.error = '';
  }

  trackProduct(_index: number, product: Product): number {
    return product.id;
  }

  changeQuantity(line: SaleLine, delta: number): void {
    if (this.saving || line.product.stock < 1) return;

    const quantity = Math.trunc(line.quantity.value ?? 0) + delta;
    line.quantity.setValue(Math.max(1, Math.min(line.product.stock, quantity)));
  }

  subtotal(line: SaleLine): number {
    return (this.lineCents(line) - this.discountCents(line)) / 100;
  }

  removeProduct(line: SaleLine): void {
    if (this.saving) return;
    this.lines = this.lines.filter(candidate => candidate !== line);
    this.error = '';
  }

  submit(): void {
    if (!this.canSubmit) return;

    const items = this.lines.map(line => ({
      product_id: line.product.id,
      quantity: line.quantity.value ?? 0,
      discount_percent: line.discount.value ?? 0,
    }));
    this.saving = true;
    this.error = '';
    this.search.disable();
    this.lines.forEach(line => {
      line.quantity.disable();
      line.discount.disable();
    });

    this.salesService.create(items).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.saving = false;
        this.search.enable();
        this.lines.forEach(line => {
          line.quantity.enable();
          line.discount.enable();
        });
      })
    ).subscribe({
      next: sale => { this.created.emit(sale); },
      error: (error: HttpErrorResponse) => { this.showError(error); }
    });
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  private lineCents(line: SaleLine): number {
    return line.quantity.invalid ? 0 : Math.round(Number(line.product.price) * 100) * (line.quantity.value ?? 0);
  }

  private discountCents(line: SaleLine): number {
    if (line.discount.invalid) return 0;

    const cents = this.lineCents(line);
    const basisPoints = Math.round((line.discount.value ?? 0) * 100);
    return Math.sign(cents) * Math.round(Math.abs(cents) * basisPoints / 10000);
  }

  private quantityValidators(stock: number) {
    return [Validators.required, Validators.min(1), Validators.max(stock), Validators.pattern(/^\d+$/)];
  }

  private showError(error: HttpErrorResponse): void {
    const data = error.error;
    if (error.status === 409) {
      const line = this.lines.find(candidate => candidate.product.id === data?.product_id);
      if (line && Number.isInteger(data.available_stock)) {
        line.product.stock = data.available_stock;
        line.quantity.setValidators(this.quantityValidators(line.product.stock));
        this.error = `Stock insuficiente para ${line.product.name}. Stock disponible: ${line.product.stock}.`;
        return;
      }
      this.error = 'El stock cambió. Revisa las cantidades.';
      return;
    }

    this.error = error.status === 422
      ? data?.message ?? 'Revisa los datos de la venta.'
      : 'No se pudo confirmar la venta. Revisa el historial antes de volver a enviarla.';
  }
}
