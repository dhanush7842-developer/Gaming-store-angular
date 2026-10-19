import { Injectable } from '@angular/core';
import { Category, Product } from '../models/product';

/**
 * Single source of truth for product data.
 * Home and Catalogue both read from here so they never disagree.
 *
 * NOTE: This is demo data stored in the app. There is no backend or database.
 * Later, getAll() can be changed to call a real API with HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Gaming PC',
      category: 'Gaming PC',
      price: 80000,
      image: '/images/gamingpc.jfif',
      description: 'High-performance desktop built for smooth, high-FPS gaming.',
      featured: true,
      bestSeller: true,
    },
    {
      id: 2,
      name: 'Gaming Laptop',
      category: 'Laptop',
      price: 65000,
      image: '/images/laptop.jfif',
      description: 'Powerful portable laptop for gaming wherever you go.',
      featured: true,
    },
    {
      id: 3,
      name: 'Graphics Card',
      category: 'Graphics Card',
      price: 35000,
      image: '/images/graphicscard.jpg',
      description: 'Dedicated GPU for sharper visuals and higher frame rates.',
      featured: true,
      bestSeller: true,
    },
    {
      id: 4,
      name: 'Gaming Mouse',
      category: 'Mouse',
      price: 1500,
      image: '/images/Gaming Mouse.jpg',
      description: 'Precise, comfortable mouse with adjustable sensitivity.',
      bestSeller: true,
    },
    {
      id: 5,
      name: 'Gaming Monitor',
      category: 'Monitor',
      price: 15000,
      image: '/images/Gaming Display.png',
      description: 'Crisp, fast display for clear and fluid gameplay.',
      featured: true,
    },
    {
      id: 6,
      name: 'Mechanical Keyboard',
      category: 'Keyboard',
      price: 4500,
      oldPrice: 5500,
      image: '/images/keyboard-mechanical.jpg',
      description: 'Full-size mechanical keyboard with responsive keys and backlighting.',
      isNew: true,
      bestSeller: true,
    },
    {
      id: 7,
      name: 'Compact TKL Keyboard',
      category: 'Keyboard',
      price: 3200,
      image: '/images/keyboard-compact.jpg',
      description: 'Space-saving tenkeyless layout that leaves more room for your mouse.',
      isNew: true,
    },
    {
      id: 8,
      name: 'Wireless Gaming Headset',
      category: 'Headset',
      price: 6000,
      image: '/images/headset-wireless.jpg',
      description: 'Cable-free headset with a clear microphone for team chat.',
      isNew: true,
    },
    {
      id: 9,
      name: 'Surround Sound Headset',
      category: 'Headset',
      price: 3800,
      oldPrice: 4500,
      image: '/images/headset-surround.jpg',
      description: 'Immersive surround audio so you can hear every move.',
    },
    {
      id: 10,
      name: 'Wireless Gaming Mouse',
      category: 'Mouse',
      price: 2800,
      image: '/images/mouse-wireless.jpg',
      description: 'Lightweight wireless mouse with a comfortable grip.',
    },
    {
      id: 11,
      name: 'Curved Gaming Monitor',
      category: 'Monitor',
      price: 24000,
      image: '/images/monitor-curved.jpg',
      description: 'Wide curved screen that wraps around your field of view.',
      featured: true,
    },
    {
      id: 12,
      name: 'Compact Gaming PC',
      category: 'Gaming PC',
      price: 55000,
      image: '/images/gaming-pc-compact.jpg',
      description: 'Space-friendly tower with a clear side panel and cooling fans.',
    },
  ];

  getAll(): Product[] {
    return this.products;
  }

  getById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getFeatured(): Product[] {
    return this.products.filter((p) => p.featured);
  }

  getNewArrivals(): Product[] {
    return this.products.filter((p) => p.isNew);
  }

  getBestSellers(): Product[] {
    return this.products.filter((p) => p.bestSeller);
  }

  getByCategory(category: Category): Product[] {
    return this.products.filter((p) => p.category === category);
  }
}
