import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Sale } from '../../services/sales.service';
import { SaleFormComponent } from './sale-form.component';
import { SalesComponent } from './sales.component';

describe('SalesComponent', () => {
  const sale: Sale = {
    id: 42,
    total: 11.73,
    total_discount: 0.62,
    created_at: '2026-11-05',
    details: [{ product: 'Ratón', quantity: 1, subtotal: 12.35, discount_percent: 5, discount_amount: 0.62, subtotal_with_discount: 11.73 }],
  };
  let fixture: ComponentFixture<SalesComponent>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesComponent, SaleFormComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule]
    });
    fixture = TestBed.createComponent(SalesComponent);
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function click(label: string): void {
    const button = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(element => element.textContent?.trim() === label)!;
    button.click();
    fixture.detectChanges();
  }

  it('refreshes the history and displays a confirmed sale', () => {
    http.expectOne({ method: 'GET', url: '/api/sales' }).flush([]);
    fixture.detectChanges();
    click('Nueva venta');
    http.expectOne('/api/products').flush([{ id: 2, name: 'Ratón', price: '11.73', stock: 1, image: null }]);
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-label="Agregar Ratón"]')!.click();
    fixture.detectChanges();
    click('Registrar venta');
    http.expectOne({ method: 'POST', url: '/api/sales' }).flush({ sale_id: 42, total: 11.73, total_discount: 0 });
    http.expectOne({ method: 'GET', url: '/api/sales' }).flush([sale]);
    fixture.detectChanges();

    expect(root.querySelector('app-sale-form')).toBeNull();
    expect(root.textContent).toContain('Venta #42 registrada');
    expect(root.querySelector('time')?.textContent).toBe('05/11/2026');
    expect(root.querySelector('tbody')?.textContent).toContain('11.73');
    expect(root.querySelector('tbody')?.textContent).toContain('−5 %');
  });

  it('asks for confirmation and retries a failed deletion before refreshing the list', () => {
    http.expectOne({ method: 'GET', url: '/api/sales' }).flush([sale]);
    fixture.detectChanges();
    click('Eliminar venta');
    expect(root.textContent).toContain('¿Eliminar la venta #42 y reponer sus unidades?');
    click('Cancelar');
    http.expectNone({ method: 'DELETE', url: '/api/sales/42' });

    click('Eliminar venta');
    click('Confirmar eliminación');
    http.expectOne({ method: 'DELETE', url: '/api/sales/42' }).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(root.querySelector('[role=alert]')?.textContent).toContain('No se pudo eliminar');

    click('Confirmar eliminación');
    http.expectOne({ method: 'DELETE', url: '/api/sales/42' }).flush({ message: 'Venta eliminada correctamente' });
    http.expectOne({ method: 'GET', url: '/api/sales' }).flush([]);
    fixture.detectChanges();
    expect(root.querySelector('details')).toBeNull();
    expect(root.textContent).toContain('Venta #42 eliminada. Se repuso el stock.');
  });
});
