import { Injectable, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DeliveryDetails, Order, OrderItem } from '../models/order';
import { CartService } from './cart.service';

const STORAGE_KEY = 'nexus_orders';
const MAX_ORDERS = 50;
export const PAYMENT_METHOD = 'Cash on delivery (demo, no payment taken)';

/**
 * Demo orders. There is no backend, so orders live only in this browser's localStorage.
 * No card or payment details are ever collected or stored.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private cart = inject(CartService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** All saved orders, newest first. */
  orders = signal<Order[]>([]);

  /** False until saved orders have been read, so pages can avoid a "not found" flash. */
  loaded = signal(false);

  constructor() {
    afterNextRender(() => this.loadFromStorage());
  }

  getById(id: string): Order | undefined {
    return this.orders().find((order) => order.id === id);
  }

  /**
   * Turns the current cart into an order and empties the cart.
   * Returns null (and changes nothing) if the cart is empty or the order could not be saved,
   * so we never show a success message for an order that was not really recorded.
   */
  place(details: DeliveryDetails): Order | null {
    const lines = this.cart.lines();
    if (!this.isBrowser || lines.length === 0) return null;

    const items: OrderItem[] = lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      image: line.product.image,
      price: line.product.price,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    }));

    const order: Order = {
      id: this.newOrderId(),
      placedAt: new Date().toISOString(),
      items,
      total: this.cart.total(),
      ...(this.cart.discount() > 0
        ? { discount: this.cart.discount(), promoCode: this.cart.promo()!.code }
        : {}),
      deliverTo: {
        fullName: details.fullName.trim(),
        city: details.city.trim(),
        pincode: details.pincode,
      },
      paymentMethod: PAYMENT_METHOD,
    };

    const updated = [order, ...this.orders()].slice(0, MAX_ORDERS);
    if (!this.save(updated)) return null;

    this.orders.set(updated);
    this.loaded.set(true);
    this.cart.clear();
    return order;
  }

  /** Reads saved orders. Bad or old data is ignored instead of crashing the app. */
  loadFromStorage() {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data: unknown = raw ? JSON.parse(raw) : [];
      this.orders.set(Array.isArray(data) ? data.filter((o) => this.looksLikeOrder(o)) : []);
    } catch {
      this.orders.set([]);
    }
    this.loaded.set(true);
  }

  private looksLikeOrder(value: any): value is Order {
    return (
      !!value &&
      typeof value.id === 'string' &&
      typeof value.placedAt === 'string' &&
      typeof value.total === 'number' &&
      typeof value.paymentMethod === 'string' &&
      typeof value.deliverTo?.fullName === 'string' &&
      Array.isArray(value.items) &&
      value.items.every(
        (i: any) =>
          typeof i?.name === 'string' &&
          typeof i?.price === 'number' &&
          typeof i?.quantity === 'number' &&
          typeof i?.lineTotal === 'number' &&
          typeof i?.productId === 'number' &&
          typeof i?.image === 'string',
      )
    );
  }

  /** Example: NX-20261018-4F7K */
  private newOrderId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id: string;
    do {
      const suffix = Array.from(
        { length: 4 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      id = `NX-${date}-${suffix}`;
    } while (this.getById(id));
    return id;
  }

  private save(orders: Order[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      return true;
    } catch {
      return false; // storage full or blocked
    }
  }
}
