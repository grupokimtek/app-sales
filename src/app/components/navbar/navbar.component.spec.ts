import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterTestingModule]
    });
    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
  });

  it('links to the home page, products and sales', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(Array.from(root.querySelectorAll('nav a'), link => link.getAttribute('href'))).toEqual(['/', '/productos', '/ventas']);
  });
});
