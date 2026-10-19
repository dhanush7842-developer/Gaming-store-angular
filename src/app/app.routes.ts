import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { GamingStore } from './gaming-store/gaming-store';
import { ProductDetails } from './product-details/product-details';
import { Cart } from './cart/cart';
import { Wishlist } from './wishlist/wishlist';
import { Checkout } from './checkout/checkout';
import { OrderConfirmation } from './order-confirmation/order-confirmation';
import { Orders } from './orders/orders';
import { NotFound } from './not-found/not-found';
import { Faq } from './faq/faq';
import { Contact } from './contact/contact';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'catalogue',
    component: GamingStore,
  },
  {
    path: 'product/:id',
    component: ProductDetails,
  },
  {
    path: 'cart',
    component: Cart,
  },
  {
    path: 'wishlist',
    component: Wishlist,
  },
  {
    path: 'checkout',
    component: Checkout,
  },
  {
    path: 'order-confirmation/:id',
    component: OrderConfirmation,
  },
  {
    path: 'orders',
    component: Orders,
  },
  {
    path: 'faq',
    component: Faq,
  },
  {
    path: 'contact',
    component: Contact,
  },
  {
    path: '**',
    component: NotFound,
  },
];
