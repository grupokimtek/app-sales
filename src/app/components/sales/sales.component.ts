import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Sale } from '../../models/sale.model';
import { NotifyService } from '../../services/notify.service';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  loading = true;

  constructor(private saleService: SaleService, private notify: NotifyService) {}

  trackById(_: number, item: Sale): number {
    return item.id;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.saleService.getAll().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  remove(sale: Sale): void {
    if (!confirm(`¿Eliminar la venta #${sale.id}? Se devolverá el stock vendido.`)) {
      return;
    }

    this.saleService.delete(sale.id).subscribe({
      next: (res) => {
        this.notify.success(res.message);
        this.load();
      },
      error: (err: HttpErrorResponse) => this.notify.httpError(err)
    });
  }
}
