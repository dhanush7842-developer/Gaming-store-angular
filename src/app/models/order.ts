/** One product line inside a saved order. Prices are copied at order time, so history never changes. */
export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

/** What the customer types on the checkout form. */
export interface DeliveryDetails {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * A saved demo order (kept only in this browser).
 * For privacy we keep just the name, city and PIN code. The mobile number and street
 * address from the form are NOT saved.
 */
export interface Order {
  id: string;
  placedAt: string; // ISO date text
  items: OrderItem[];
  total: number; // final amount after any discount
  discount?: number; // promo discount in rupees (only present when a code was used)
  promoCode?: string;
  deliverTo: { fullName: string; city: string; pincode: string };
  paymentMethod: string;
}
