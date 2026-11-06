import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  it('shows catalog fields and replaces a failed image with a placeholder', () => {
    TestBed.configureTestingModule({ declarations: [ProductsComponent], imports: [HttpClientTestingModule] });
    const fixture = TestBed.createComponent(ProductsComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/products').flush([
      { id: 1, name: 'Monitor', price: '12.34', stock: 3, image: '/test-image.png', created_at: null, updated_at: null },
    ]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Monitor');
    expect(root.textContent).toContain('12.34');
    expect(root.textContent).toContain('Sin registro');
    const image = root.querySelector<HTMLImageElement>('img');
    expect(image?.alt).toBe('Monitor');
    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(root.querySelector('[aria-label="Sin imagen para Monitor"]')).not.toBeNull();
    http.verify();
  });
});
