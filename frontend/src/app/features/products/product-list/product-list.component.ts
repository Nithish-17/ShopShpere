import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ProductResponse, CategoryResponse, Page, ProductSearchRequest } from '../../../core/models';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    PaginationComponent,
    EmptyStateComponent,
    ButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container catalog-page">
      <!-- Breadcrumb & Header -->
      <div class="catalog-header">
        <div>
          <h1 class="catalog-title">Product Catalog</h1>
          <p class="catalog-subtitle">
            @if (totalElements() > 0) {
              Showing {{ totalElements() }} tech products
            } @else {
              Explore all devices and accessories
            }
          </p>
        </div>

        <div class="catalog-controls">
          <!-- Sort Selector -->
          <div class="sort-wrapper">
            <label for="sortSelect" class="control-label">Sort by:</label>
            <select
              id="sortSelect"
              class="form-select sort-select"
              [ngModel]="selectedSort()"
              (ngModelChange)="onSortChange($event)"
            >
              <option value="name,asc">Name (A to Z)</option>
              <option value="name,desc">Name (Z to A)</option>
              <option value="price,asc">Price (Low to High)</option>
              <option value="price,desc">Price (High to Low)</option>
            </select>
          </div>

          <!-- Mobile Filter Toggle Button -->
          <button
            type="button"
            class="btn-mobile-filter"
            (click)="isMobileFilterOpen.update(v => !v)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div class="catalog-layout">
        <!-- Filter Sidebar -->
        <aside class="catalog-sidebar" [class.mobile-filter-open]="isMobileFilterOpen()">
          <div class="sidebar-header">
            <h3 class="sidebar-title">Filters</h3>
            <button type="button" class="btn-clear-filters" (click)="resetFilters()">Reset</button>
            <button type="button" class="btn-close-filter-mobile" (click)="isMobileFilterOpen.set(false)">&times;</button>
          </div>

          <!-- Search Query Filter -->
          <div class="filter-group">
            <label class="filter-label" for="keywordFilter">Search Keyword</label>
            <input
              id="keywordFilter"
              type="text"
              class="form-control filter-input"
              placeholder="e.g. iPhone, Watch"
              [ngModel]="keyword()"
              (ngModelChange)="keyword.set($event)"
              (keyup.enter)="applyFilters()"
            />
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label" for="catFilter">Category</label>
            <select
              id="catFilter"
              class="form-select filter-select"
              [ngModel]="selectedCategoryId()"
              (ngModelChange)="selectedCategoryId.set($event); applyFilters()"
            >
              <option [ngValue]="null">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <label class="filter-label" for="brandFilter">Brand</label>
            <input
              id="brandFilter"
              type="text"
              class="form-control filter-input"
              placeholder="e.g. Apple, Samsung"
              [ngModel]="brand()"
              (ngModelChange)="brand.set($event)"
              (keyup.enter)="applyFilters()"
            />
          </div>

          <!-- Price Range Filter -->
          <div class="filter-group">
            <label class="filter-label">Price Range (₹)</label>
            <div class="price-inputs">
              <input
                type="number"
                class="form-control filter-input"
                placeholder="Min"
                [ngModel]="minPrice()"
                (ngModelChange)="minPrice.set($event)"
                min="0"
              />
              <span class="price-separator">-</span>
              <input
                type="number"
                class="form-control filter-input"
                placeholder="Max"
                [ngModel]="maxPrice()"
                (ngModelChange)="maxPrice.set($event)"
                min="0"
              />
            </div>
          </div>

          <!-- In-Stock Toggle -->
          <div class="filter-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                class="checkbox-input"
                [checked]="inStockOnly()"
                (change)="onInStockToggle($event)"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <!-- Apply Button -->
          <div class="filter-apply-wrapper">
            <app-button variant="primary" class="w-full" (clicked)="applyFilters()">
              Apply Filters
            </app-button>
          </div>
        </aside>

        <!-- Product Grid Area -->
        <div class="catalog-main">
          @if (loading()) {
            <div class="product-grid-skeleton">
              @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
                <div class="skeleton-card animate-pulse"></div>
              }
            </div>
          } @else if (products().length === 0) {
            <app-empty-state
              icon="search"
              title="No products found"
              description="Try adjusting or clearing your search filters to find what you're looking for."
              actionLabel="Reset Filters"
              (actionClicked)="resetFilters()"
            ></app-empty-state>
          } @else {
            <div class="product-grid">
              @for (prod of products(); track prod.id) {
                <app-product-card [product]="prod"></app-product-card>
              }
            </div>

            <!-- Pagination Component -->
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              (pageChange)="onPageChange($event)"
            ></app-pagination>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page {
      padding-top: var(--space-8);
      padding-bottom: var(--space-12);
    }

    .catalog-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: var(--space-8);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .catalog-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .catalog-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .catalog-controls {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .control-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    .sort-select {
      width: auto;
      padding: 0.5rem 2rem 0.5rem 0.875rem;
      font-size: 0.875rem;
    }

    .btn-mobile-filter {
      display: none;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      background-color: var(--color-bg-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }

    .catalog-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .catalog-sidebar {
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      position: sticky;
      top: calc(var(--header-height) + 1.5rem);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }

    .sidebar-title {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .btn-clear-filters {
      background: none;
      border: none;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-accent);
      cursor: pointer;
    }

    .btn-clear-filters:hover {
      text-decoration: underline;
    }

    .btn-close-filter-mobile {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-text-muted);
      cursor: pointer;
    }

    .filter-group {
      margin-bottom: var(--space-4);
    }

    .filter-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.375rem;
      display: block;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .price-separator {
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .checkbox-input {
      width: 1.125rem;
      height: 1.125rem;
      accent-color: var(--color-brand);
      cursor: pointer;
    }

    .filter-apply-wrapper {
      margin-top: var(--space-6);
    }

    .w-full { width: 100%; display: block; }
    .w-full button { width: 100%; }

    .catalog-main {
      min-width: 0;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-6);
    }

    .product-grid-skeleton {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-6);
    }

    .skeleton-card {
      height: 360px;
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-lg);
    }

    @media (max-width: 900px) {
      .catalog-layout {
        grid-template-columns: 1fr;
      }

      .btn-mobile-filter {
        display: flex;
      }

      .catalog-sidebar {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 1000;
        border-radius: 0;
        overflow-y: auto;
      }

      .catalog-sidebar.mobile-filter-open {
        display: block;
      }

      .btn-close-filter-mobile {
        display: block;
      }
    }
  `]
})
export default class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  categories = signal<CategoryResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  loading = signal<boolean>(true);

  // Filter Signals
  keyword = signal<string>('');
  selectedCategoryId = signal<number | null>(null);
  brand = signal<string>('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal<boolean>(false);
  selectedSort = signal<string>('name,asc');
  isMobileFilterOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });

    this.route.queryParams.subscribe(params => {
      this.keyword.set(params['keyword'] || '');
      this.selectedCategoryId.set(params['categoryId'] ? Number(params['categoryId']) : null);
      this.brand.set(params['brand'] || '');
      this.minPrice.set(params['minPrice'] ? Number(params['minPrice']) : null);
      this.maxPrice.set(params['maxPrice'] ? Number(params['maxPrice']) : null);
      this.inStockOnly.set(params['inStock'] === 'true');
      this.selectedSort.set(params['sort'] || 'name,asc');
      this.currentPage.set(params['page'] ? Number(params['page']) : 0);

      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading.set(true);

    const searchReq: ProductSearchRequest = {
      keyword: this.keyword() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      brand: this.brand() || undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      inStock: this.inStockOnly() ? true : undefined,
      sort: this.selectedSort(),
      page: this.currentPage(),
      size: 12
    };

    this.productService.searchProducts(searchReq).subscribe({
      next: (page: Page<ProductResponse>) => {
        this.products.set(page.content || []);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.isMobileFilterOpen.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword() || null,
        categoryId: this.selectedCategoryId() || null,
        brand: this.brand() || null,
        minPrice: this.minPrice() || null,
        maxPrice: this.maxPrice() || null,
        inStock: this.inStockOnly() ? 'true' : null,
        sort: this.selectedSort(),
        page: 0
      },
      queryParamsHandling: 'merge'
    });
  }

  resetFilters(): void {
    this.keyword.set('');
    this.selectedCategoryId.set(null);
    this.brand.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockOnly.set(false);
    this.selectedSort.set('name,asc');
    this.currentPage.set(0);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  onSortChange(sortValue: string): void {
    this.selectedSort.set(sortValue);
    this.applyFilters();
  }

  onInStockToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.inStockOnly.set(checked);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
