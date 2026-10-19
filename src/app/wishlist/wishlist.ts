import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { ToastService } from '../shared/toast/toast.service';
import { ProductCard } from '../shared/product-card/product-card';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  clear() {
    this.wishlist.clear();
    this.toast.show('Wishlist cleared.', 'info');
  }
}
