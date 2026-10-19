import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GamingStore } from './gaming-store';
import { CartService } from '../services/cart.service';

describe('GamingStore', () => {
  let component: GamingStore;
  let fixture: ComponentFixture<GamingStore>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GamingStore],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GamingStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should still render the original five product images first', () => {
    fixture.detectChanges();

    const imageSources = Array.from(
      fixture.nativeElement.querySelectorAll('img'),
      (image: HTMLImageElement) => image.getAttribute('src'),
    );

    expect(imageSources.slice(0, 5)).toEqual([
      '/images/gamingpc.jfif',
      '/images/laptop.jfif',
      '/images/graphicscard.jpg',
      '/images/Gaming Mouse.jpg',
      '/images/Gaming Display.png',
    ]);
    expect(imageSources.length).toBe(12);
  });

  it('filters by search text', () => {
    component.searchText.set('keyboard');
    expect(component.filteredProducts().length).toBe(2);
  });

  it('filters by category and price range', () => {
    component.selectedCategory.set('Mouse');
    component.priceIndex.set(1); // under 5,000
    expect(component.filteredProducts().map((p) => p.name)).toEqual([
      'Gaming Mouse',
      'Wireless Gaming Mouse',
    ]);
  });

  it('sorts by price low to high and high to low', () => {
    component.sortBy.set('price-asc');
    const asc = component.filteredProducts().map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    component.sortBy.set('price-desc');
    const desc = component.filteredProducts().map((p) => p.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('shows the empty state when nothing matches and clears filters', () => {
    component.searchText.set('zzzz-no-match');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No products found');

    component.clearFilters();
    expect(component.filteredProducts().length).toBe(12);
  });

  it('adds a product to the shared cart when its button is clicked', () => {
    fixture.detectChanges();
    const cart = TestBed.inject(CartService);
    expect(cart.count()).toBe(0);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary');
    button.click();

    expect(cart.count()).toBe(1);
    expect(cart.lines()[0].product.name).toBe('Gaming PC');
  });
});
