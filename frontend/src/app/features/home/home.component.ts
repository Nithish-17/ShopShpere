import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../products/services/product.service';
import { CategoryService } from '../products/services/category.service';
import { ProductResponse, CategoryResponse } from '../../core/models';
import { ProductCardComponent } from '../products/components/product-card/product-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-content">
            <span class="hero-eyebrow">Minimalist Tech Storefront</span>
            <h1 class="hero-heading">Crafted for modern workflow & digital lifestyle.</h1>
            <p class="hero-description">
              Explore our curated selection of flagship electronics, productivity hardware, and precision accessories with instant stock verification.
            </p>
            <div class="hero-actions">
              <a routerLink="/products" class="hero-primary-btn">
                Browse Full Catalog &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Spotlight -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Shop by Category</h2>
              <p class="section-subtitle">Find gear tailored to your exact setup</p>
            </div>
            <a routerLink="/products" class="section-link">View All Products &rarr;</a>
          </div>

          @if (categoriesLoading()) {
            <app-spinner size="sm"></app-spinner>
          } @else {
            <div class="category-grid">
              @for (cat of categories(); track cat.id) {
                <a [routerLink]="['/products']" [queryParams]="{ categoryId: cat.id }" class="category-card">
                  <div class="category-card-inner">
                    <span class="category-icon">{{ cat.name.charAt(0).toUpperCase() }}</span>
                    <h3 class="category-name">{{ cat.name }}</h3>
                    @if (cat.description) {
                      <p class="category-desc">{{ cat.description }}</p>
                    }
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Trending / New Arrivals Grid -->
      <section class="section featured-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">New Arrivals</h2>
              <p class="section-subtitle">Recently added items</p>
            </div>
            <a routerLink="/products" class="section-link">Explore Catalog &rarr;</a>
          </div>

          @if (productsLoading()) {
            <div class="product-grid-skeleton">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="skeleton-card animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="product-grid">
              @for (prod of products(); track prod.id) {
                <app-product-card [product]="prod"></app-product-card>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      padding: var(--space-16) 0;
      position: relative;
      overflow: hidden;
    }

    .hero-container {
      position: relative;
      z-index: 2;
    }

    .hero-content {
      max-width: 680px;
    }

    .hero-eyebrow {
      display: inline-block;
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #93c5fd;
      margin-bottom: var(--space-3);
    }

    .hero-heading {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.15;
      color: var(--color-text-inverse);
      margin-bottom: var(--space-4);
      letter-spacing: -0.03em;
    }

    .hero-description {
      font-size: 1.125rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: var(--space-8);
    }

    .hero-primary-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-brand);
      background-color: var(--color-text-inverse);
      border-radius: var(--radius-md);
      text-decoration: none;
      box-shadow: var(--shadow-lg);
      transition: all var(--transition-fast);
    }

    .hero-primary-btn:hover {
      transform: translateY(-2px);
      background-color: #f8fafc;
      color: var(--color-accent-hover);
    }

    .section {
      padding: var(--space-12) 0;
    }

    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: var(--space-8);
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .section-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .section-link {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-accent);
    }

    .section-link:hover {
      text-decoration: underline;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
    }

    .category-card {
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      text-decoration: none;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-fast);
      display: block;
    }

    .category-card:hover {
      border-color: var(--color-border-subtle);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .category-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md);
      background-color: var(--color-bg-muted);
      color: var(--color-brand);
      font-weight: 800;
      font-family: var(--font-display);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-bottom: var(--space-3);
    }

    .category-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .category-desc {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-6);
    }

    .product-grid-skeleton {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-6);
    }

    .skeleton-card {
      height: 360px;
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-lg);
    }

    .value-props-section {
      background-color: var(--color-bg-surface);
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }

    .value-props-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-8);
    }

    .value-prop-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .prop-icon {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-md);
      background-color: var(--color-accent-subtle);
      color: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .prop-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .prop-desc {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .hero-heading { font-size: 2.25rem; }
      .section-header { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
    }
  `]
})
export default class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  categories = signal<CategoryResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  categoriesLoading = signal<boolean>(true);
  productsLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: cats => {
        this.categories.set(cats);
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false)
    });

    this.productService.getProducts(0, 8, 'createdAt,desc').subscribe({
      next: page => {
        this.products.set(page.content || []);
        this.productsLoading.set(false);
      },
      error: () => this.productsLoading.set(false)
    });
  }
}
