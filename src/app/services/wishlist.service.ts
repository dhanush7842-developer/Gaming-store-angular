import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product';
import { ProductService } from './product.service';

const STORAGE_KEY = 'nexus_wishlist';

/** Favourite products. Only product ids are saved in localStorage (demo data). */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private productService = inject(ProductService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private ids = signal<number[]>([]);

  products = computed<Product[]>(() =>
    this.ids().flatMap((id) => {
      const product = this.productService.getById(id);
      return product ? [product] : [];
    }),
  );

  count = computed(() => this.products().length);

  constructor() {
    afterNextRender(() => this.loadFromStorage());
  }

  has(productId: number): boolean {
    return this.ids().includes(productId);
  }

  /** Adds the product if missing, removes it if present. Returns true when it was added. */
  toggle(productId: number): boolean {
    const added = !this.has(productId);
    this.ids.update((list) =>
      added ? [...list, productId] : list.filter((id) => id !== productId),
    );
    this.save();
    return added;
  }

  clear() {
    this.ids.set([]);
    this.save();
  }

  loadFromStorage() {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return;
      this.ids.set(
        data.filter((id) => Number.isInteger(id) && this.productService.getById(id) !== undefined),
      );
    } catch {
      this.ids.set([]);
    }
  }

  private save() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    } catch {
      // ignore storage errors (full or blocked storage)
    }
  }
}
