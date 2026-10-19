import { TestBed } from '@angular/core/testing';
import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
  let wishlist: WishlistService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    wishlist = TestBed.inject(WishlistService);
  });

  it('starts empty', () => {
    expect(wishlist.count()).toBe(0);
  });

  it('toggles a product on and off', () => {
    expect(wishlist.toggle(3)).toBe(true);
    expect(wishlist.has(3)).toBe(true);
    expect(wishlist.count()).toBe(1);

    expect(wishlist.toggle(3)).toBe(false);
    expect(wishlist.has(3)).toBe(false);
  });

  it('saves to localStorage and restores', () => {
    wishlist.toggle(2);
    wishlist.toggle(5);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(WishlistService);
    restored.loadFromStorage();

    expect(restored.products().map((p) => p.id)).toEqual([2, 5]);
  });

  it('ignores corrupt data', () => {
    localStorage.setItem('nexus_wishlist', 'oops');
    wishlist.loadFromStorage();
    expect(wishlist.count()).toBe(0);
  });
});
