import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { Cart } from './cart';

describe('Cart page promo code', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!, 2); // ₹3,000
  });

  it('shows the demo codes', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cart', Cart);
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('NEXUS10');
    expect(text).toContain('GEAR500');
  });

  it('shows an error for a bad code and the discount for a good one', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/cart', Cart);

    page.applyPromo('WRONG');
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('not valid');

    page.applyPromo('NEXUS10');
    harness.detectChanges();
    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('NEXUS10 applied');
    expect(text).toContain('₹300'); // discount
    expect(text).toContain('₹2,700'); // new total
  });
});
