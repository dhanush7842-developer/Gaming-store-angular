import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { Orders } from './orders';

const DETAILS = {
  fullName: 'Dhanush Kumar',
  mobile: '9876543210',
  address: '12 Main Street, Hyderabad',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500001',
};

describe('Order history page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows the empty state when there are no orders', async () => {
    TestBed.inject(OrderService).loadFromStorage();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/orders', Orders);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('No orders yet');
  });

  it('lists orders, newest first, with totals', async () => {
    const cart = TestBed.inject(CartService);
    const products = TestBed.inject(ProductService);
    const orders = TestBed.inject(OrderService);

    cart.add(products.getById(4)!); // ₹1,500
    const first = orders.place(DETAILS)!;
    cart.add(products.getById(5)!); // ₹15,000
    const second = orders.place(DETAILS)!;

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/orders', Orders);
    harness.detectChanges();

    const ids = Array.from(harness.routeNativeElement!.querySelectorAll('summary .id'), (e) =>
      e.textContent!.trim(),
    );
    expect(ids).toEqual([second.id, first.id]);
    expect(harness.routeNativeElement!.textContent).toContain('₹15,000');
    expect(harness.routeNativeElement!.textContent).toContain('₹1,500');
  });
});
