import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
}

interface SaleDetail {
  product: string;
  quantity: number;
  subtotal: number;
}

interface Sale {
  id: number;
  total: number;
  created_at: string;
  details: SaleDetail[];
}

interface SaleResponse {
  message: string;
  sale_id: number;
  total: number;
}

interface CartLine {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  sales: Sale[] = [];
  cart = new Map<number, number>();
  currentView: 'catalog' | 'sales' = 'catalog';
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  isLoadingSales = false;
  salesError = '';
  isCreatingSale = false;
  noticeMessage = '';
  noticeIsError = false;
  failedImages = new Set<number>();

  private readonly currencyFormatter = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  });

  private readonly productImages: Record<number, string> = {
    1: '/assets/product-laptop.jpg',
    2: '/assets/product-mouse-new.jpg',
    3: '/assets/product-keyboard-new.jpg',
    4: '/assets/product-monitor-new.jpg',
    5: '/assets/product-headphones.jpg',
    6: '/assets/product-webcam-free.jpg',
    7: '/assets/product-ssd-commons.jpg',
    8: '/assets/product-ram-new.jpg',
    9: '/assets/product-printer-new.jpg',
    10: '/assets/product-tablet-new.jpg',
  };

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadSales();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('es');
    return this.products.filter((product) => product.name.toLocaleLowerCase('es').includes(term));
  }

  get totalUnits(): number {
    return this.products.reduce((total, product) => total + Number(product.stock), 0);
  }

  get cartLines(): CartLine[] {
    return [...this.cart.entries()]
      .map(([id, quantity]) => ({ product: this.products.find((product) => product.id === id), quantity }))
      .filter((line): line is CartLine => Boolean(line.product));
  }

  get cartCount(): number {
    return this.cartLines.reduce((total, line) => total + line.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartLines.reduce((total, line) => total + Number(line.product.price) * line.quantity, 0);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        this.cart.forEach((quantity, id) => {
          const product = products.find((item) => item.id === id);
          if (!product || product.stock < quantity) this.cart.set(id, product?.stock || 0);
          if (this.cart.get(id) === 0) this.cart.delete(id);
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No se pudo conectar con Laravel. Verifica que el API esté activo.';
        this.isLoading = false;
      },
    });
  }

  loadSales(): void {
    this.isLoadingSales = true;
    this.salesError = '';
    this.http.get<Sale[]>('/api/sales').subscribe({
      next: (sales) => {
        this.sales = sales;
        this.isLoadingSales = false;
      },
      error: (error: HttpErrorResponse) => {
        this.salesError = this.messageFromError(error);
        this.isLoadingSales = false;
      },
    });
  }

  selectView(view: 'catalog' | 'sales'): void {
    this.currentView = view;
    if (view === 'sales') this.loadSales();
  }

  addToCart(product: Product): void {
    const quantity = this.cart.get(product.id) || 0;
    if (quantity >= product.stock) return;
    this.cart.set(product.id, quantity + 1);
    this.clearNotice();
  }

  changeQuantity(productId: number, difference: number): void {
    const quantity = (this.cart.get(productId) || 0) + difference;
    if (quantity <= 0) this.cart.delete(productId);
    else this.cart.set(productId, quantity);
  }

  createSale(): void {
    if (!this.cart.size || this.isCreatingSale) return;
    this.isCreatingSale = true;
    this.clearNotice();

    const items = [...this.cart.entries()].map(([product_id, quantity]) => ({ product_id, quantity }));
    this.http.post<SaleResponse>('/api/sales', { items }).subscribe({
      next: (response) => {
        this.cart.clear();
        this.isCreatingSale = false;
        this.currentView = 'sales';
        this.showNotice(`${response.message}. Total: ${this.formatPrice(response.total)}`);
        this.loadProducts();
        this.loadSales();
      },
      error: (error: HttpErrorResponse) => {
        this.isCreatingSale = false;
        this.showNotice(this.messageFromError(error), true);
      },
    });
  }

  deleteSale(saleId: number): void {
    if (!window.confirm(`¿Eliminar la venta #${saleId}? El stock vendido no se repondrá.`)) return;

    this.http.delete<{ message: string }>(`/api/sales/${saleId}`).subscribe({
      next: (response) => {
        this.showNotice(response.message);
        this.loadSales();
      },
      error: (error: HttpErrorResponse) => this.showNotice(this.messageFromError(error), true),
    });
  }

  formatPrice(price: number): string {
    return this.currencyFormatter.format(Number(price));
  }

  productImage(product: Product): string | null {
    return product.image || this.productImages[product.id] || null;
  }

  productBackground(product: Product): string {
    const image = this.productImage(product);
    return image && !this.failedImages.has(product.id) ? `url("${image}")` : '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }

  stockStatus(stock: number): string {
    if (stock <= 0) return 'Agotado';
    if (stock <= 5) return 'Últimas unidades';
    return 'Disponible';
  }

  stockClass(stock: number): string {
    if (stock <= 0) return 'stock-empty';
    if (stock <= 5) return 'stock-low';
    return 'stock-ready';
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  hideBrokenImage(productId: number): void {
    this.failedImages.add(productId);
  }

  trackProduct(_index: number, product: Product): number {
    return product.id;
  }

  trackCartLine(_index: number, line: CartLine): number {
    return line.product.id;
  }

  trackSale(_index: number, sale: Sale): number {
    return sale.id;
  }

  private messageFromError(error: HttpErrorResponse): string {
    const validationErrors = error.error?.errors;
    if (validationErrors) return Object.values(validationErrors).flat().join(' ');
    return error.error?.message || 'No se pudo completar la solicitud. Verifica que Laravel esté activo.';
  }

  private showNotice(message: string, isError = false): void {
    this.noticeMessage = message;
    this.noticeIsError = isError;
    window.setTimeout(() => {
      if (this.noticeMessage === message) this.noticeMessage = '';
    }, 4500);
  }

  private clearNotice(): void {
    this.noticeMessage = '';
    this.noticeIsError = false;
  }
}
