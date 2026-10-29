import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SaleService } from './sale.service';

describe('SaleService', () => {
  let service: SaleService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/sales`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SaleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists sales with GET /sales', () => {
    service.getAll().subscribe((sales) => expect(sales).toEqual([]));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a sale with POST /sales', () => {
    const body = { user_id: 1, items: [{ product_id: 1, quantity: 2, discount_percent: 0 }] };
    service.create(body).subscribe((res) => expect(res.sale_id).toBe(1));
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ message: 'ok', sale_id: 1, total: 15000 });
  });

  it('deletes a sale with DELETE /sales/:id', () => {
    service.delete(5).subscribe();
    const req = http.expectOne(`${url}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });
});
