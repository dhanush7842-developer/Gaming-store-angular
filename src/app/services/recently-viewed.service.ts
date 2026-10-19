import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product';
import { ProductService } from './product.service';

const STORAGE_KEY = 'nexus_recent';
const MAX_ITEMS = 8;

/** Remembers the last products the visitor opened (ids only, saved in this browser). */
@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private productService = inject(ProductService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private hasLoaded = false;

  private ids = signal<number[]>([]);

  /** Newest first. */
  products = computed<Product[]>(() =>
    this.ids().flatMap((id) => {
      const product = this.productService.getById(id);
      return product ? [product] : [];
    }),
  );

  constructor() {
    afterNextRender(() => this.loadFromStorage());
  }

  /** Moves the product to the front of the list. */
  add(productId: number) {
    if (!this.isBrowser) return;
    // Make sure saved items are read first, so we never overwrite them with a shorter list.
    this.loadFromStorage();

    this.ids.update((list) =>
      [productId, ...list.filter((id) => id !== productId)].slice(0, MAX_ITEMS),
    );
    this.save();
  }

  clear() {
    this.ids.set([]);
    this.save();
  }

  loadFromStorage() {
    if (!this.isBrowser || this.hasLoaded) return;
    this.hasLoaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return;
      const valid = data.filter(
        (id) => Number.isInteger(id) && this.productService.getById(id) !== undefined,
      );
      // keep anything added before this load finished
      this.ids.update((current) =>
        [...current, ...valid.filter((id) => !current.includes(id))].slice(0, MAX_ITEMS),
      );
    } catch {
      // ignore bad data
    }
  }

  private save() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    } catch {
      // ignore storage errors
    }
  }
}
