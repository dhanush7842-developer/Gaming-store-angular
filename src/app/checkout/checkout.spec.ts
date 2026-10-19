import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { Checkout } from './checkout';

const VALID = {
  fullName: 'Dhanush Kumar',
  mobile: '9876543210',
  address: '12 Main Street, Hyderabad',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500001',
};

describe('Checkout page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows an empty state when the cart is empty', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/checkout', Checkout);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('Your cart is empty');
    expect(harness.routeNativeElement!.querySelector('form')).toBeNull();
  });

  it('shows the cart in the order summary and says it is a demo', async () => {
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!, 2);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/checkout', Checkout);
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('Gaming Mouse');
    expect(text).toContain('₹3,000');
    expect(text).toContain('no payment is taken');
  });

  it('does not place an order when the form is empty or invalid', async () => {
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!);
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/checkout', Checkout);

    page.placeOrder();
    harness.detectChanges();

    expect(harness.routeNativeElement!.querySelectorAll('.field-error').length).toBe(6);
    expect(TestBed.inject(OrderService).orders().length).toBe(0);
    expect(TestBed.inject(CartService).count()).toBe(1);
  });

  it('validates mobile number and PIN code', async () => {
    const harness = await RouterTestingHarness.create();
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!);
    const page = await harness.navigateByUrl('/checkout', Checkout);

    for (const bad of ['123', '5123456789', '98abc43210']) {
      page.form.patchValue({ ...VALID, mobile: bad });
      expect(page.form.controls.mobile.valid).toBe(false);
    }
    for (const bad of ['50001', '0500001', '5000011', 'abcdef']) {
      page.form.patchValue({ ...VALID, pincode: bad });
      expect(page.form.controls.pincode.valid).toBe(false);
    }
    page.form.setValue(VALID);
    expect(page.form.valid).toBe(true);
  });

  it('places the order, empties the cart and opens the confirmation page', async () => {
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!, 2);
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/checkout', Checkout);

    page.form.setValue(VALID);
    page.placeOrder();
    await harness.fixture.whenStable();

    const orders = TestBed.inject(OrderService).orders();
    expect(orders.length).toBe(1);
    expect(orders[0].total).toBe(3000);
    expect(TestBed.inject(CartService).count()).toBe(0);
    expect(TestBed.inject(Router).url).toBe('/order-confirmation/' + orders[0].id);
  });

  it('shows an error and keeps the cart when the order cannot be saved', async () => {
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!);
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/checkout', Checkout);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key === 'nexus_orders') throw new Error('quota');
    });
    page.form.setValue(VALID);
    page.placeOrder();
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('could not save your order');
    expect(TestBed.inject(CartService).count()).toBe(1);
    expect(TestBed.inject(Router).url).toBe('/checkout');
    vi.restoreAllMocks();
  });
});
