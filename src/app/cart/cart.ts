import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, MAX_QUANTITY, PROMO_CODES } from '../services/cart.service';
import { ToastService } from '../shared/toast/toast.service';
import { ImgFallback } from '../shared/img-fallback.directive';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, ImgFallback, InrPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cart = inject(CartService);
  private toast = inject(ToastService);

  maxQuantity = MAX_QUANTITY;
  promoCodes = PROMO_CODES;
  promoMessage = signal<{ text: string; ok: boolean } | null>(null);

  changeQuantity(productId: number, current: number, change: number) {
    this.cart.setQuantity(productId, current + change);
  }

  remove(productId: number, name: string) {
    this.cart.remove(productId);
    this.toast.show(name + ' removed from cart.', 'info');
  }

  applyPromo(code: string) {
    const result = this.cart.applyPromo(code);
    this.promoMessage.set({ text: result.message, ok: result.ok });
  }

  removePromo() {
    this.cart.removePromo();
    this.promoMessage.set({ text: 'Promo code removed.', ok: true });
  }

  clear() {
    this.cart.clear();
    this.promoMessage.set(null);
    this.toast.show('Cart cleared.', 'info');
  }
}
