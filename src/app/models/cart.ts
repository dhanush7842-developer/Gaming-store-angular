import { Product } from './product';

/** What we save in localStorage: only the product id and quantity. */
export interface CartItem {
  productId: number;
  quantity: number;
}

/** What the cart page shows: the full product plus the line total. */
export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}
