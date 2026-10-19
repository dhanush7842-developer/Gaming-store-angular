import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { OrderConfirmation } from './order-confirmation';

describe('Order confirmation page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows the order details and a demo notice', async () => {
    TestBed.inject(CartService).add(TestBed.inject(ProductService).getById(4)!, 2);
    const order = TestBed.inject(OrderService).place({
      fullName: 'Dhanush Kumar',
      mobile: '9876543210',
      address: '12 Main Street, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
    })!;

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/order-confirmation/' + order.id, OrderConfirmation);
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain(order.id);
    expect(text).toContain('Gaming Mouse');
    expect(text).toContain('₹3,000');
    expect(text).toContain('No payment was taken');
  });

  it('shows "Order not found" for an unknown order id', async () => {
    TestBed.inject(OrderService).loadFromStorage();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/order-confirmation/NX-00000000-ZZZZ', OrderConfirmation);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('Order not found');
  });
});
