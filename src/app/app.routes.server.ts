import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // These pages depend on the URL or on data saved in the browser (cart, wishlist, orders),
  // so they are rendered in the browser instead of prerendered.
  { path: 'product/:id', renderMode: RenderMode.Client },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'wishlist', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'orders', renderMode: RenderMode.Client },
  { path: 'order-confirmation/:id', renderMode: RenderMode.Client },

  // Static pages, prerendered as HTML
  { path: 'home', renderMode: RenderMode.Prerender },
  { path: 'catalogue', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },

  // "/" redirects to /home; any unknown address gets the 404 page with a real 404 status
  { path: '', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
