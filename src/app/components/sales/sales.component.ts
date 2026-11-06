import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { CreatedSale, Sale, SalesService } from '../../services/sales.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  loading = false;
  error = false;
  showForm = false;
  confirmation?: CreatedSale;
  deleteCandidate?: number;
  deletingId?: number;
  deletedId?: number;
  deleteError = '';
  private salesRequest?: Subscription;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly salesService: SalesService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.salesRequest?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.salesRequest = this.salesService.list().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: sales => { this.sales = sales; },
      error: () => { this.error = true; }
    });
  }

  saleCreated(sale: CreatedSale): void {
    this.showForm = false;
    this.confirmation = sale;
    this.deletedId = undefined;
    this.loadSales();
  }

  requestDeletion(id: number): void {
    this.deleteCandidate = id;
    this.deleteError = '';
    this.deletedId = undefined;
  }

  deleteSale(id: number): void {
    if (this.deletingId !== undefined || this.deleteCandidate !== id) return;

    this.deletingId = id;
    this.deleteError = '';
    this.salesService.delete(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.deletingId = undefined; })
    ).subscribe({
      next: () => {
        this.deleteCandidate = undefined;
        this.deletedId = id;
        if (this.confirmation?.sale_id === id) this.confirmation = undefined;
        this.loadSales();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.deleteCandidate = undefined;
          this.deleteError = 'La venta ya no está disponible.';
          this.loadSales();
        } else {
          this.deleteError = 'No se pudo eliminar la venta. Intenta de nuevo.';
        }
      }
    });
  }

  trackSale(_index: number, sale: Sale): number {
    return sale.id;
  }
}
