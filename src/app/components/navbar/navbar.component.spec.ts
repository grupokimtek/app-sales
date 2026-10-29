import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [NavbarComponent]
    });
    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
  });

  it('should link to products, sales and new sale', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a.nav-link')).map(
      (a) => (a as HTMLAnchorElement).textContent?.trim()
    );
    expect(links).toEqual(['Productos', 'Ventas', 'Nueva venta']);
  });
});
