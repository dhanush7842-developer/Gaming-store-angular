import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  cart = inject(CartService);
  wishlist = inject(WishlistService);

  // true when the mobile menu is open
  menuOpen = signal(false);

  links = [
    { label: 'Home', path: '/home' },
    { label: 'Catalogue', path: '/catalogue' },
    { label: 'Orders', path: '/orders' },
  ];

  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
