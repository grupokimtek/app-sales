import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { SaleFormComponent } from './sale-form.component';

describe('SaleFormComponent', () => {
  let fixture: ComponentFixture<SaleFormComponent>;
  let component: SaleFormComponent;
  const laptop: Product = { id: 1, name: 'Laptop', price: 7500, stock: 10 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule],
      declarations: [SaleFormComponent]
    });
    fixture = TestBed.createComponent(SaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/products`).flush([laptop]);
  });

  it('requires at least one product', () => {
    expect(component.cartError).toBeTruthy();
  });

  it('calculates subtotal, discount and total', () => {
    component.add(laptop);
    component.cart[0].quantity = 2;
    component.cart[0].discount_percent = 10;
    component.recalculate();

    expect(component.totalDiscount).toBe(1500);
    expect(component.total).toBe(13500);
    expect(component.cartError).toBeNull();
  });

  it('rejects quantity above stock, zero quantity and discount above 10', () => {
    component.add(laptop);

    component.cart[0].quantity = 11;
    component.recalculate();
    expect(component.cartError).toContain('Stock insuficiente');

    component.cart[0].quantity = 0;
    component.recalculate();
    expect(component.cartError).toContain('mayor que cero');

    component.cart[0].quantity = 1;
    component.cart[0].discount_percent = 11;
    component.recalculate();
    expect(component.cartError).toContain('descuento');
  });
});
