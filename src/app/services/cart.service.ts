import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartLine } from '../models/cart';
import { Product } from '../models/product';
import { ProductService } from './product.service';

const STORAGE_KEY = 'nexus_cart';
export const MAX_QUANTITY = 10;

/** A demo promo code. There is no real promotions system, so these are fixed sample codes. */
export interface Promo {
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number; // percent (e.g. 10) or rupees (e.g. 500)
  maxDiscount?: number; // upper limit in rupees (for percent codes)
  minSubtotal: number; // cart subtotal needed to use the code
}

export const PROMO_CODES: Promo[] = [
  {
    code: 'NEXUS10',
    description: '10% off (up to ₹5,000)',
    type: 'percent',
    value: 10,
    maxDiscount: 5000,
    minSubtotal: 1000,
  },
  { code: 'GEAR500', description: '₹500 off', type: 'flat', value: 500, minSubtotal: 5000 },
];

export interface PromoResult {
  ok: boolean;
  message: string;
}

/**
 * Shopping cart shared by the whole app (navbar, catalogue, details, cart page).
 * Only product ids and quantities are saved in localStorage (demo data, nothing sensitive).
 * Prices and names are always read from ProductService, so they never go stale.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private productService = inject(ProductService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private items = signal<CartItem[]>([]);

  /** The promo code currently applied (kept in memory only, so a page refresh removes it). */
  promo = signal<Promo | null>(null);

  /** Cart rows with product details and line totals. */
  lines = computed<CartLine[]>(() =>
    this.items().flatMap((item) => {
      const product = this.productService.getById(item.productId);
      return product
        ? [{ product, quantity: item.quantity, lineTotal: product.price * item.quantity }]
        : [];
    }),
  );

  /** Total number of units in the cart (shown in the navbar). */
  count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));

  subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.lineTotal, 0));

  /** Money taken off by the promo code (0 if none, or if the cart is below the minimum). */
  discount = computed(() => {
    const promo = this.promo();
    const subtotal = this.subtotal();
    if (!promo || subtotal < promo.minSubtotal) return 0;

    const raw = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
    return Math.min(raw, promo.maxDiscount ?? raw, subtotal);
  });

  /** How much more the customer must add before the applied code works (0 if already fine). */
  promoShortfall = computed(() => {
    const promo = this.promo();
    return promo ? Math.max(promo.minSubtotal - this.subtotal(), 0) : 0;
  });

  /** No tax or shipping is calculated, so total = subtotal minus the promo discount. */
  total = computed(() => this.subtotal() - this.discount());

  constructor() {
    // Load saved items only after the first browser render, so the server-rendered
    // HTML and the first browser render match (avoids hydration mismatches).
    afterNextRender(() => this.loadFromStorage());
  }

  /** Adds a product. Returns false if the maximum quantity was already reached. */
  add(product: Product, quantity = 1): boolean {
    const current = this.items().find((i) => i.productId === product.id);
    const oldQty = current?.quantity ?? 0;
    const newQty = Math.min(oldQty + quantity, MAX_QUANTITY);

    if (newQty === oldQty) {
      return false;
    }

    if (current) {
      this.items.update((list) =>
        list.map((i) => (i.productId === product.id ? { ...i, quantity: newQty } : i)),
      );
    } else {
      this.items.update((list) => [...list, { productId: product.id, quantity: newQty }]);
    }
    this.save();
    return true;
  }

  setQuantity(productId: number, quantity: number) {
    const safe = Math.min(Math.max(Math.floor(quantity), 1), MAX_QUANTITY);
    this.items.update((list) =>
      list.map((i) => (i.productId === productId ? { ...i, quantity: safe } : i)),
    );
    this.save();
  }

  remove(productId: number) {
    this.items.update((list) => list.filter((i) => i.productId !== productId));
    this.save();
  }

  clear() {
    this.items.set([]);
    this.promo.set(null);
    this.save();
  }

  /** Checks a typed code and applies it if valid. Codes are not case-sensitive. */
  applyPromo(input: string): PromoResult {
    const code = input.trim().toUpperCase();
    if (!code) return { ok: false, message: 'Enter a promo code.' };

    const promo = PROMO_CODES.find((p) => p.code === code);
    if (!promo) return { ok: false, message: 'That promo code is not valid.' };

    if (this.items().length === 0) return { ok: false, message: 'Add items to your cart first.' };

    const shortfall = promo.minSubtotal - this.subtotal();
    if (shortfall > 0) {
      return {
        ok: false,
        message: `${promo.code} needs a cart subtotal of at least ₹${promo.minSubtotal.toLocaleString('en-IN')}.`,
      };
    }

    this.promo.set(promo);
    return { ok: true, message: `${promo.code} applied: ${promo.description}.` };
  }

  removePromo() {
    this.promo.set(null);
  }

  quantityOf(productId: number): number {
    return this.items().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  /** Reads the saved cart. Bad or old data is ignored instead of crashing the app. */
  loadFromStorage() {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return;

      const valid: CartItem[] = data
        .filter(
          (i) => Number.isInteger(i?.productId) && Number.isInteger(i?.quantity) && i.quantity >= 1,
        )
        .filter((i) => this.productService.getById(i.productId) !== undefined)
        .map((i) => ({ productId: i.productId, quantity: Math.min(i.quantity, MAX_QUANTITY) }));

      this.items.set(valid);
    } catch {
      this.items.set([]);
    }
  }

  private save() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      // Storage can be full or blocked (private mode). The cart still works until reload.
    }
  }
}
