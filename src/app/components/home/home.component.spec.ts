import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('loads real catalog data and filters the selection by category', () => {
    TestBed.inject(HttpTestingController).expectOne('/api/products').flush([
      { id: 1, name: 'Laptop Lenovo', price: '7500.00', stock: 3, image: null },
      { id: 2, name: 'Auriculares Gamer', price: '320.99', stock: 4, image: null },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('#seleccion li').length).toBe(2);
    const audio = Array.from(root.querySelectorAll<HTMLButtonElement>('nav button')).find(button => button.textContent?.includes('Audio'));
    audio?.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('#seleccion li').length).toBe(1);
    expect(root.querySelector('#seleccion h3')?.textContent).toContain('Auriculares Gamer');
  });
});
