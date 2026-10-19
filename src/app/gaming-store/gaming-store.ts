import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORIES, Category, Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { ProductCard } from '../shared/product-card/product-card';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name';

@Component({
  selector: 'app-gaming-store',
  imports: [FormsModule, RouterLink, ProductCard],
  templateUrl: './gaming-store.html',
  styleUrl: './gaming-store.css',
})
export class GamingStore {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  categories = CATEGORIES;

  priceRanges = [
    { label: 'Any price', min: 0, max: Infinity },
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹20,000', min: 5000, max: 20000 },
    { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
    { label: 'Above ₹50,000', min: 50000, max: Infinity },
  ];

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  // ----- Filter state (signals) -----
  searchText = signal('');
  selectedCategory = signal<Category | 'All'>('All');
  priceIndex = signal(0); // index into priceRanges
  sortBy = signal<SortOption>('relevance');

  private allProducts = this.productService.getAll();

  /** Products after search + category + price filters + sorting. */
  filteredProducts = computed<Product[]>(() => {
    const text = this.searchText().trim().toLowerCase();
    const category = this.selectedCategory();
    const range = this.priceRanges[this.priceIndex()];

    let list = this.allProducts.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        p.price >= range.min &&
        p.price < range.max &&
        (text === '' ||
          p.name.toLowerCase().includes(text) ||
          p.category.toLowerCase().includes(text)),
    );

    // slice() makes a copy so we never reorder the original array
    switch (this.sortBy()) {
      case 'price-asc':
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  });

  hasActiveFilters = computed(
    () =>
      this.searchText() !== '' ||
      this.selectedCategory() !== 'All' ||
      this.priceIndex() !== 0 ||
      this.sortBy() !== 'relevance',
  );

  constructor() {
    // Home page category tiles link here as /catalogue?category=Keyboard
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      if (category && (CATEGORIES as readonly string[]).includes(category)) {
        this.selectedCategory.set(category as Category);
      }
    });
  }

  clearFilters() {
    this.searchText.set('');
    this.selectedCategory.set('All');
    this.priceIndex.set(0);
    this.sortBy.set('relevance');
  }
}
