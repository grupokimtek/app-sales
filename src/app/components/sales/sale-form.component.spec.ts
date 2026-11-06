import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../services/products.service';
import { SaleFormComponent } from './sale-form.component';

describe('SaleFormComponent', () => {
  const mouse: Product = { id: 2, name: 'Ratón inalámbrico', price: '12.35', stock: 3, image: null, created_at: null, updated_at: null };
  const laptop: Product = { id: 1, name: 'Laptop Lenovo', price: '7500.00', stock: 2, image: null, created_at: null, updated_at: null };
  let fixture: ComponentFixture<SaleFormComponent>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [SaleFormComponent], imports: [HttpClientTestingModule, ReactiveFormsModule] });
    fixture = TestBed.createComponent(SaleFormComponent);
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();
    http.expectOne('/api/products').flush([{ ...mouse }, { ...laptop }]);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function input(selector: string, value: string): void {
    const element = root.querySelector<HTMLInputElement>(selector)!;
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function button(selector: string): HTMLButtonElement {
    return root.querySelector<HTMLButtonElement>(selector)!;
  }

  it('searches by name, prevents duplicate items and calculates the discounted total', () => {
    input('#sale-search', 'raton');
    expect(root.querySelectorAll('[aria-label="Resultados de productos"] li').length).toBe(1);
    button('[aria-label="Agregar Ratón inalámbrico"]').click();
    fixture.detectChanges();
    expect(button('[aria-label="Agregado: Ratón inalámbrico"]').disabled).toBeTrue();

    button('[aria-label="Sumar unidad de Ratón inalámbrico"]').click();
    fixture.detectChanges();
    input('#discount-2', '5');
    expect(root.textContent).toContain('−1.24');
    expect(root.textContent).toContain('23.46');

    const created = jasmine.createSpy('created');
    fixture.componentInstance.created.subscribe(created);
    button('[type=submit]').click();
    fixture.detectChanges();
    const request = http.expectOne({ method: 'POST', url: '/api/sales' });
    expect(request.request.body).toEqual({ user_id: 1, items: [{ product_id: 2, quantity: 2, discount_percent: 5 }] });
    expect(button('[type=submit]').disabled).toBeTrue();
    const sale = { sale_id: 9, total: 23.46, total_discount: 1.24 };
    request.flush(sale, { status: 201, statusText: 'Created' });
    expect(created).toHaveBeenCalledOnceWith(sale);
  });

  it('blocks invalid quantities and discounts', () => {
    button('[aria-label="Agregar Ratón inalámbrico"]').click();
    fixture.detectChanges();
    for (const value of ['0', '1.5', '4']) {
      input('#quantity-2', value);
      expect(button('[type=submit]').disabled).toBeTrue();
    }
    input('#quantity-2', '1');
    for (const value of ['-1', '10.01', '0.001']) {
      input('#discount-2', value);
      expect(button('[type=submit]').disabled).toBeTrue();
    }
    http.expectNone('/api/sales');
  });

  it('keeps the selection and applies the updated limit after a stock conflict', () => {
    button('[aria-label="Agregar Ratón inalámbrico"]').click();
    fixture.detectChanges();
    input('#quantity-2', '2');
    input('#discount-2', '5');
    button('[type=submit]').click();
    http.expectOne({ method: 'POST', url: '/api/sales' })
      .flush({ product_id: 2, available_stock: 1 }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(root.querySelector('[role=alert]')?.textContent).toContain('Stock disponible: 1');
    expect(root.querySelector<HTMLInputElement>('#quantity-2')?.value).toBe('2');
    expect(root.querySelector<HTMLInputElement>('#quantity-2')?.max).toBe('1');
    expect(button('[type=submit]').disabled).toBeTrue();

    button('[aria-label="Restar unidad de Ratón inalámbrico"]').click();
    fixture.detectChanges();
    button('[type=submit]').click();
    const retry = http.expectOne({ method: 'POST', url: '/api/sales' });
    expect(retry.request.body.items).toEqual([{ product_id: 2, quantity: 1, discount_percent: 5 }]);
    retry.flush({ sale_id: 9, total: 11.73, total_discount: 0.62 });
  });
});
