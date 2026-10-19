import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { Cart } from './cart';

describe('Cart page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows the empty state', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cart', Cart);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('Your cart is empty');
  });

  it('lists items with the total, and removes them', async () => {
    const harness = await RouterTestingHarness.create();
    const cart = TestBed.inject(CartService);
    cart.add(TestBed.inject(ProductService).getById(4)!, 2);

    const page = await harness.navigateByUrl('/cart', Cart);
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('Gaming Mouse');
    expect(text).toContain('₹3,000');

    page.remove(4, 'Gaming Mouse');
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Your cart is empty');
  });
});
