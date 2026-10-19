import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { OrderService, PAYMENT_METHOD } from './order.service';
import { ProductService } from './product.service';

const DETAILS = {
  fullName: '  Dhanush Kumar ',
  mobile: '9876543210',
  address: '12 Secret Street, Hyderabad',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500001',
};

describe('OrderService', () => {
  let orders: OrderService;
  let cart: CartService;
  let products: ProductService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    orders = TestBed.inject(OrderService);
    cart = TestBed.inject(CartService);
    products = TestBed.inject(ProductService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('does nothing when the cart is empty', () => {
    expect(orders.place(DETAILS)).toBeNull();
    expect(orders.orders().length).toBe(0);
  });

  it('turns the cart into an order, then empties the cart', () => {
    cart.add(products.getById(1)!); // ₹80,000
    cart.add(products.getById(4)!, 2); // 2 x ₹1,500

    const order = orders.place(DETAILS)!;

    expect(order.id).toMatch(/^NX-\d{8}-[A-Z0-9]{4}$/);
    expect(order.total).toBe(83000);
    expect(order.items.map((i) => [i.name, i.quantity, i.lineTotal])).toEqual([
      ['Gaming PC', 1, 80000],
      ['Gaming Mouse', 2, 3000],
    ]);
    expect(order.paymentMethod).toBe(PAYMENT_METHOD);
    expect(cart.count()).toBe(0);
    expect(orders.getById(order.id)).toEqual(order);
  });

  it('keeps newest orders first and gives each a different id', () => {
    cart.add(products.getById(4)!);
    const first = orders.place(DETAILS)!;
    cart.add(products.getById(5)!);
    const second = orders.place(DETAILS)!;

    expect(first.id).not.toBe(second.id);
    expect(orders.orders().map((o) => o.id)).toEqual([second.id, first.id]);
  });

  it('saves only name, city and PIN code (not the mobile number or street address)', () => {
    cart.add(products.getById(4)!);
    orders.place(DETAILS);

    const saved = localStorage.getItem('nexus_orders')!;
    expect(saved).toContain('Dhanush Kumar');
    expect(saved).toContain('Hyderabad');
    expect(saved).toContain('500001');
    expect(saved).not.toContain('9876543210');
    expect(saved).not.toContain('Secret Street');
    expect(saved.toLowerCase()).not.toContain('card');
  });

  it('keeps the original price in history even if the product list changes later', () => {
    cart.add(products.getById(4)!);
    const order = orders.place(DETAILS)!;
    expect(order.items[0].price).toBe(1500);
  });

  it('restores saved orders after a reload', () => {
    cart.add(products.getById(4)!);
    const order = orders.place(DETAILS)!;

    TestBed.resetTestingModule();
    const restored = TestBed.inject(OrderService);
    restored.loadFromStorage();

    expect(restored.loaded()).toBe(true);
    expect(restored.getById(order.id)?.total).toBe(1500);
  });

  it('does not claim success when the order cannot be saved', () => {
    cart.add(products.getById(4)!);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key === 'nexus_orders') throw new Error('quota');
    });

    expect(orders.place(DETAILS)).toBeNull();
    expect(orders.orders().length).toBe(0);
    expect(cart.count()).toBe(1); // the cart is untouched
  });

  it('ignores corrupt or malformed saved data', () => {
    localStorage.setItem('nexus_orders', '{broken');
    orders.loadFromStorage();
    expect(orders.orders()).toEqual([]);

    localStorage.setItem('nexus_orders', JSON.stringify([{ id: 5 }, 'x', null]));
    orders.loadFromStorage();
    expect(orders.orders()).toEqual([]);
  });

  it('records the promo code and discount, and the final total', () => {
    cart.add(products.getById(4)!, 2); // ₹3,000
    cart.applyPromo('NEXUS10'); // -₹300

    const order = orders.place(DETAILS)!;

    expect(order.total).toBe(2700);
    expect(order.discount).toBe(300);
    expect(order.promoCode).toBe('NEXUS10');
    expect(cart.promo()).toBeNull(); // promo is cleared with the cart
  });

  it('has no discount fields when no promo code was used', () => {
    cart.add(products.getById(4)!);
    const order = orders.place(DETAILS)!;
    expect(order.discount).toBeUndefined();
    expect(order.promoCode).toBeUndefined();
  });
});
