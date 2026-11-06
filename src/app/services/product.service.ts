import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api';

  getProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products`);
  }
}