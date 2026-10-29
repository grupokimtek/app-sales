import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateSaleResponse, Sale, SaleRequest } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private url = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.url);
  }

  create(sale: SaleRequest): Observable<CreateSaleResponse> {
    return this.http.post<CreateSaleResponse>(this.url, sale);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
