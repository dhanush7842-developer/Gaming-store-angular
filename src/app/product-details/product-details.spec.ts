import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { RecentlyViewedService } from '../services/recently-viewed.service';
import { Home } from '../home/home';
import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows the product from the URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/product/4', ProductDetails);
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('Gaming Mouse');
    expect(text).toContain('₹1,500');
  });

  it('shows a not-found message for an unknown id', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/product/999', ProductDetails);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('Product not found');
  });

  it('adds the chosen quantity to the cart', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/product/4', ProductDetails);

    page.changeQuantity(1);
    page.changeQuantity(1);
    page.addToCart();

    expect(TestBed.inject(CartService).quantityOf(4)).toBe(3);
  });

  it('remembers viewed products and shows them on the Home page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/product/5', ProductDetails);
    harness.detectChanges();
    await harness.navigateByUrl('/product/2', ProductDetails);
    harness.detectChanges();

    expect(
      TestBed.inject(RecentlyViewedService)
        .products()
        .map((p) => p.id),
    ).toEqual([2, 5]);

    await harness.navigateByUrl('/home', Home);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Recently viewed');
  });

  it('does not show "Recently viewed" on Home before any product is opened', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/home', Home);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).not.toContain('Recently viewed');
  });
});
