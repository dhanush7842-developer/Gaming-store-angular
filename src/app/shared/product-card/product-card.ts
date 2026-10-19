import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { CartService, MAX_QUANTITY } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../toast/toast.service';
import { ImgFallback } from '../img-fallback.directive';
import { InrPipe } from '../inr.pipe';

/**
 * Reusable card that shows one product (Home, Catalogue, Wishlist, Product details).
 * It talks to the shared cart and wishlist services itself, so every page behaves the same.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ImgFallback, InrPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  private cart = inject(CartService);
  private toast = inject(ToastService);
  wishlist = inject(WishlistService);

  product = input.required<Product>();
  showAction = input(true); // hide the Add to Cart button where it is not needed

  addToCart() {
    const product = this.product();
    if (this.cart.add(product)) {
      this.toast.show(product.name + ' added to cart.', 'success');
    } else {
      this.toast.show('You can add at most ' + MAX_QUANTITY + ' of each item.', 'info');
    }
  }

  toggleWishlist() {
    const product = this.product();
    const added = this.wishlist.toggle(product.id);
    this.toast.show(
      added
        ? product.name + ' saved to your wishlist.'
        : product.name + ' removed from your wishlist.',
      added ? 'success' : 'info',
    );
  }
}
