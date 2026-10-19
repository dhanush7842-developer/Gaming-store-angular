import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, Category, Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { RecentlyViewedService } from '../services/recently-viewed.service';
import { ProductCard } from '../shared/product-card/product-card';
import { ImgFallback } from '../shared/img-fallback.directive';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, ImgFallback, InrPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private productService = inject(ProductService);
  recent = inject(RecentlyViewedService);

  featured = this.productService.getFeatured().slice(0, 4);
  newArrivals = this.productService.getNewArrivals().slice(0, 3);
  bestSellers = this.productService.getBestSellers().slice(0, 3);

  // Hero image and the offer tile use real products from the service
  heroProduct: Product = this.productService.getAll()[0];
  offerProduct: Product =
    this.productService.getAll().find((p) => p.oldPrice) ?? this.productService.getAll()[0];

  /** One tile per category, with a product count and a sample image. */
  categoryTiles = CATEGORIES.map((name: Category) => {
    const items = this.productService.getByCategory(name);
    return { name, count: items.length, image: items[0]?.image ?? '' };
  });
}
