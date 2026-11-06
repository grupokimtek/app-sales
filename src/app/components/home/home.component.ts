import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product, ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];
  loading = true;
  loadError = false;
  paused = false;
  failedImages = new Set<number>();
  activeCategory = 'Todo';
  readonly categories = [
    { name: 'Todo', icon: 'ri-apps-2-line' },
    { name: 'Computación', icon: 'ri-macbook-line' },
    { name: 'Accesorios', icon: 'ri-keyboard-line' },
    { name: 'Audio', icon: 'ri-headphone-line' },
    { name: 'Pantallas', icon: 'ri-computer-line' }
  ];
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  constructor(private readonly productsService: ProductsService, private readonly element: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.productsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.element.nativeElement.querySelectorAll('.reveal').forEach(node => node.classList.add('is-visible'));
      return;
    }
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    this.element.nativeElement.querySelectorAll('.reveal').forEach(node => this.observer?.observe(node));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  productIcon(product: Product): string {
    const name = product.name.toLowerCase();
    if (name.includes('laptop')) return 'ri-macbook-line';
    if (name.includes('mouse')) return 'ri-mouse-line';
    if (name.includes('teclado')) return 'ri-keyboard-line';
    if (name.includes('monitor')) return 'ri-computer-line';
    if (name.includes('auricular')) return 'ri-headphone-line';
    if (name.includes('webcam')) return 'ri-webcam-line';
    if (name.includes('tablet')) return 'ri-tablet-line';
    if (name.includes('impresora')) return 'ri-printer-line';
    if (name.includes('ssd')) return 'ri-hard-drive-3-line';
    if (name.includes('ram')) return 'ri-cpu-line';
    return 'ri-box-3-line';
  }

  get selectedProducts(): Product[] {
    return this.products.filter(product => this.activeCategory === 'Todo' || this.categoryOf(product) === this.activeCategory).slice(0, 6);
  }

  categoryCount(category: string): number {
    return this.products.filter(product => category === 'Todo' || this.categoryOf(product) === category).length;
  }

  private categoryOf(product: Product): string {
    const name = product.name.toLowerCase();
    if (name.includes('laptop') || name.includes('tablet')) return 'Computación';
    if (name.includes('monitor')) return 'Pantallas';
    if (name.includes('auricular')) return 'Audio';
    return 'Accesorios';
  }

  trackProduct(_index: number, product: Product): number {
    return product.id;
  }

  markImageUnavailable(id: number): void {
    this.failedImages.add(id);
  }

  tiltScene(event: PointerEvent): void {
    if (this.paused || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scene = event.currentTarget as HTMLElement;
    const bounds = scene.getBoundingClientRect();
    scene.style.setProperty('--tilt-x', `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 10}deg`);
    scene.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}deg`);
  }

  resetScene(event: PointerEvent): void {
    const scene = event.currentTarget as HTMLElement;
    scene.style.setProperty('--tilt-x', '0deg');
    scene.style.setProperty('--tilt-y', '0deg');
  }

}
