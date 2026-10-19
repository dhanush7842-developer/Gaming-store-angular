/** All product categories sold in the store. */
export const CATEGORIES = [
  'Gaming PC',
  'Laptop',
  'Graphics Card',
  'Keyboard',
  'Mouse',
  'Monitor',
  'Headset',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** One product in the catalogue. Prices are in Indian Rupees (INR). */
export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number; // optional "before" price, shown struck through
  image: string;
  description: string;
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
}
