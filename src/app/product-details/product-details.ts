import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductService } from '../services/product.service';
import { CartService, MAX_QUANTITY } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { RecentlyViewedService } from '../services/recently-viewed.service';
import { ToastService } from '../shared/toast/toast.service';
import { ProductCard } from '../shared/product-card/product-card';
import { ImgFallback } from '../shared/img-fallback.directive';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, ProductCard, ImgFallback, InrPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  wishlist = inject(WishlistService);
  private recent = inject(RecentlyViewedService);

  maxQuantity = MAX_QUANTITY;
  quantity = signal(1);

  // The product id comes from the URL: /product/3
  private id = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), {
    initialValue: NaN,
  });

  product = computed(() => this.productService.getById(this.id()));

  /** Up to 3 other products from the same category. */
  related = computed(() => {
    const current = this.product();
    return current
      ? this.productService
          .getByCategory(current.category)
          .filter((p) => p.id !== current.id)
          .slice(0, 3)
      : [];
  });

  constructor() {
    // Remember this product as "recently viewed" each time a product page opens
    effect(() => {
      const product = this.product();
      if (product) {
        untracked(() => this.recent.add(product.id));
      }
    });
  }

  changeQuantity(change: number) {
    this.quantity.update((q) => Math.min(Math.max(q + change, 1), MAX_QUANTITY));
  }

  addToCart() {
    const product = this.product();
    if (!product) return;
    if (this.cart.add(product, this.quantity())) {
      this.toast.show(product.name + ' added to cart.', 'success');
    } else {
      this.toast.show('You can add at most ' + MAX_QUANTITY + ' of each item.', 'info');
    }
  }

  toggleWishlist() {
    const product = this.product();
    if (!product) return;
    const added = this.wishlist.toggle(product.id);
    this.toast.show(
      added
        ? product.name + ' saved to your wishlist.'
        : product.name + ' removed from your wishlist.',
      added ? 'success' : 'info',
    );
  }
}
