import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleDetail {
  product: string | null;
  quantity: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  subtotal_with_discount: number;
}

export interface Sale {
  id: number;
  total: number;
  total_discount: number;
  created_at: string | null;
  details: SaleDetail[];
}

export interface SaleItem {
  product_id: number;
  quantity: number;
  discount_percent?: number;
}

export interface CreatedSale {
  sale_id: number;
  total: number;
  total_discount: number;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Sale[]> {
    return this.http.get<Sale[]>('/api/sales');
  }

  create(items: SaleItem[]): Observable<CreatedSale> {
    return this.http.post<CreatedSale>('/api/sales', { user_id: 1, items });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/sales/${id}`);
  }
}
