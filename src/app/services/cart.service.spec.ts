import { TestBed } from '@angular/core/testing';
import { CartService, MAX_QUANTITY } from './cart.service';
import { ProductService } from './product.service';

describe('CartService', () => {
  let cart: CartService;
  let gamingPc: ReturnType<ProductService['getAll']>[number];
  let mouse: ReturnType<ProductService['getAll']>[number];

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    cart = TestBed.inject(CartService);
    const products = TestBed.inject(ProductService);
    gamingPc = products.getById(1)!; // ₹80,000
    mouse = products.getById(4)!; // ₹1,500
  });

  it('starts empty', () => {
    expect(cart.count()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('adds products and calculates the subtotal and total', () => {
    cart.add(gamingPc);
    cart.add(mouse, 2);

    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(80000 + 2 * 1500);
    expect(cart.total()).toBe(83000);
  });

  it('merges repeated adds of the same product into one line', () => {
    cart.add(mouse);
    cart.add(mouse);

    expect(cart.lines().length).toBe(1);
    expect(cart.quantityOf(mouse.id)).toBe(2);
  });

  it('never goes above the maximum quantity', () => {
    expect(cart.add(mouse, MAX_QUANTITY)).toBe(true);
    expect(cart.add(mouse)).toBe(false);
    expect(cart.quantityOf(mouse.id)).toBe(MAX_QUANTITY);
  });

  it('updates quantity within 1 and the maximum', () => {
    cart.add(mouse);
    cart.setQuantity(mouse.id, 5);
    expect(cart.quantityOf(mouse.id)).toBe(5);

    cart.setQuantity(mouse.id, 0);
    expect(cart.quantityOf(mouse.id)).toBe(1);

    cart.setQuantity(mouse.id, 999);
    expect(cart.quantityOf(mouse.id)).toBe(MAX_QUANTITY);
  });

  it('removes one item and clears everything', () => {
    cart.add(gamingPc);
    cart.add(mouse);

    cart.remove(gamingPc.id);
    expect(cart.lines().map((l) => l.product.id)).toEqual([mouse.id]);

    cart.clear();
    expect(cart.count()).toBe(0);
  });

  it('saves to localStorage and restores the cart', () => {
    cart.add(gamingPc);
    cart.add(mouse, 3);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(CartService);
    restored.loadFromStorage();

    expect(restored.count()).toBe(4);
    expect(restored.subtotal()).toBe(80000 + 3 * 1500);
  });

  it('ignores corrupt or unknown saved data', () => {
    localStorage.setItem('nexus_cart', '{not valid json');
    cart.loadFromStorage();
    expect(cart.count()).toBe(0);

    localStorage.setItem(
      'nexus_cart',
      JSON.stringify([
        { productId: 999, quantity: 2 }, // unknown product
        { productId: 4, quantity: -3 }, // invalid quantity
        { productId: 4, quantity: 50 }, // too many -> limited to the maximum
      ]),
    );
    cart.loadFromStorage();
    expect(cart.lines().length).toBe(1);
    expect(cart.quantityOf(4)).toBe(MAX_QUANTITY);
  });

  describe('promo codes', () => {
    it('rejects empty, unknown and too-early codes', () => {
      expect(cart.applyPromo('NEXUS10').message).toContain('Add items'); // empty cart
      cart.add(mouse); // ₹1,500
      expect(cart.applyPromo('   ').ok).toBe(false);
      expect(cart.applyPromo('FAKE').message).toContain('not valid');
      expect(cart.applyPromo('GEAR500').message).toContain('at least ₹5,000');
      expect(cart.promo()).toBeNull();
    });

    it('applies a percentage code (not case-sensitive) and lowers the total', () => {
      cart.add(mouse, 2); // ₹3,000
      expect(cart.applyPromo(' nexus10 ').ok).toBe(true);

      expect(cart.discount()).toBe(300);
      expect(cart.total()).toBe(2700);
      expect(cart.subtotal()).toBe(3000);
    });

    it('caps a percentage discount at its maximum', () => {
      cart.add(gamingPc); // ₹80,000 -> 10% = 8,000, capped at 5,000
      cart.applyPromo('NEXUS10');
      expect(cart.discount()).toBe(5000);
      expect(cart.total()).toBe(75000);
    });

    it('applies a flat code', () => {
      cart.add(gamingPc);
      cart.applyPromo('GEAR500');
      expect(cart.discount()).toBe(500);
      expect(cart.total()).toBe(79500);
    });

    it('stops discounting when the cart falls below the minimum', () => {
      cart.add(mouse, 4); // ₹6,000
      cart.applyPromo('GEAR500');
      expect(cart.discount()).toBe(500);

      cart.setQuantity(mouse.id, 1); // ₹1,500
      expect(cart.discount()).toBe(0);
      expect(cart.total()).toBe(1500);
      expect(cart.promoShortfall()).toBe(3500);
    });

    it('can be removed, and clearing the cart removes it too', () => {
      cart.add(mouse, 2);
      cart.applyPromo('NEXUS10');
      cart.removePromo();
      expect(cart.discount()).toBe(0);

      cart.applyPromo('NEXUS10');
      cart.clear();
      expect(cart.promo()).toBeNull();
    });
  });
});
