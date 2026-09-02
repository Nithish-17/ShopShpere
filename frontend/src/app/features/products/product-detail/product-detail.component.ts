import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductImageService } from '../services/product-image.service';
import { CartService } from '../../cart/services/cart.service';
import { ProductResponse, ProductImageResponse } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyInrPipe,
    ImageFallbackDirective,
    ButtonComponent,
    SpinnerComponent,
    EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container product-detail-page">
      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading product details..."></app-spinner>
      } @else if (!product()) {
        <app-empty-state
          title="Product not found"
          description="The requested product does not exist or has been discontinued."
          actionLabel="Return to Catalog"
          (actionClicked)="router.navigate(['/products'])"
        ></app-empty-state>
      } @else {
        <!-- Breadcrumb Navigation -->
        <nav class="detail-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a>
          <span class="separator">/</span>
          <a routerLink="/products">Products</a>
          <span class="separator">/</span>
          <a [routerLink]="['/products']" [queryParams]="{ categoryId: product()?.categoryId }">
            {{ product()?.categoryName }}
          </a>
          <span class="separator">/</span>
          <span class="current">{{ product()?.name }}</span>
        </nav>

        <div class="detail-grid">
          <!-- Gallery Column -->
          <div class="gallery-column">
            <div class="main-image-frame">
              @if (activeImageUrl()) {
                <img
                  [src]="activeImageUrl()"
                  [alt]="product()?.name"
                  class="main-image"
                  appImageFallback
                />
              } @else {
                <div class="main-image-placeholder">
                  <span>{{ product()?.name?.charAt(0)?.toUpperCase() }}</span>
                </div>
              }
            </div>

            <!-- Thumbnail Selector -->
            @if (images().length > 1) {
              <div class="thumbnails-row">
                @for (img of images(); track img.id) {
                  <button
                    type="button"
                    class="thumbnail-btn"
                    [class.active]="activeImageUrl() === img.url"
                    (click)="activeImageUrl.set(img.url)"
                  >
                    <img [src]="img.url" [alt]="img.originalFileName" appImageFallback />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Information & Purchase Column -->
          <div class="info-column">
            <div class="product-brand-tag">{{ product()?.brand }}</div>
            <h1 class="detail-title">{{ product()?.name }}</h1>

            <div class="price-container">
              <span class="detail-price">{{ product()?.price | currencyInr }}</span>
              <span class="tax-badge">Inclusive of all taxes</span>
            </div>

            <div class="divider"></div>

            <div class="detail-section">
              <h4 class="section-label">Description</h4>
              <p class="detail-description">{{ product()?.description || 'No detailed description provided for this product.' }}</p>
            </div>

            <div class="detail-section">
              <h4 class="section-label">Category</h4>
              <a [routerLink]="['/products']" [queryParams]="{ categoryId: product()?.categoryId }" class="category-link">
                {{ product()?.categoryName }}
              </a>
            </div>

            <div class="divider"></div>

            <!-- Quantity & Actions -->
            <div class="purchase-controls">
              <div class="quantity-control-group">
                <label class="section-label" for="qtyInput">Quantity</label>
                <div class="stepper-box">
                  <button
                    type="button"
                    class="btn-step"
                    [disabled]="quantity() <= 1"
                    (click)="quantity.update(q => q - 1)"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span id="qtyInput" class="stepper-display">{{ quantity() }}</span>
                  <button
                    type="button"
                    class="btn-step"
                    (click)="quantity.update(q => q + 1)"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="purchase-buttons">
                <app-button
                  variant="primary"
                  size="lg"
                  [loading]="addingToCart()"
                  (clicked)="onAddToCart()"
                  class="btn-action"
                >
                  Add to Cart
                </app-button>
                <app-button
                  variant="secondary"
                  size="lg"
                  (clicked)="onBuyNow()"
                  class="btn-action"
                >
                  Buy Now
                </app-button>
              </div>
            </div>

            <!-- Value Badge -->
            <div class="assurance-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Instant physical stock reservation upon adding to cart</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding-top: var(--space-6);
      padding-bottom: var(--space-16);
    }

    .detail-breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .detail-breadcrumb a {
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .detail-breadcrumb a:hover {
      color: var(--color-brand);
    }

    .detail-breadcrumb .separator {
      color: var(--color-border-subtle);
    }

    .detail-breadcrumb .current {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-12);
      align-items: start;
    }

    .gallery-column {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .main-image-frame {
      width: 100%;
      height: 480px;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: var(--space-4);
    }

    .main-image-placeholder {
      font-size: 5rem;
      font-weight: 800;
      font-family: var(--font-display);
      color: var(--color-text-muted);
    }

    .thumbnails-row {
      display: flex;
      gap: var(--space-3);
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }

    .thumbnail-btn {
      width: 80px;
      height: 80px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-bg-surface);
      cursor: pointer;
      overflow: hidden;
      padding: var(--space-1);
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .thumbnail-btn:hover {
      border-color: var(--color-border-subtle);
    }

    .thumbnail-btn.active {
      border-color: var(--color-brand);
      box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1);
    }

    .thumbnail-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    .info-column {
      display: flex;
      flex-direction: column;
    }

    .product-brand-tag {
      font-size: 0.8125rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent);
      margin-bottom: var(--space-2);
    }

    .detail-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
      line-height: 1.2;
    }

    .price-container {
      display: flex;
      align-items: baseline;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .detail-price {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .tax-badge {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-6) 0;
    }

    .detail-section {
      margin-bottom: var(--space-4);
    }

    .section-label {
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
      display: block;
    }

    .detail-description {
      font-size: 1rem;
      color: var(--color-text-secondary);
      line-height: 1.7;
    }

    .category-link {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: var(--color-bg-muted);
      color: var(--color-text-primary);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .purchase-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      margin-top: var(--space-2);
    }

    .stepper-box {
      display: inline-flex;
      align-items: center;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      width: fit-content;
    }

    .btn-step {
      width: 2.5rem;
      height: 2.5rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-step:hover:not(:disabled) {
      background-color: var(--color-bg-muted);
    }

    .btn-step:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .stepper-display {
      width: 3rem;
      text-align: center;
      font-size: 1rem;
      font-weight: 700;
    }

    .purchase-buttons {
      display: flex;
      gap: var(--space-4);
    }

    .btn-action {
      flex: 1;
    }

    .assurance-box {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-8);
      padding: var(--space-4);
      background-color: var(--color-info-bg);
      border: 1px solid var(--color-info-border);
      border-radius: var(--radius-md);
      color: #0369a1;
      font-size: 0.875rem;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: var(--space-8);
      }

      .main-image-frame {
        height: 360px;
      }
    }
  `]
})
export default class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly imageService = inject(ProductImageService);
  private readonly cartService = inject(CartService);

  product = signal<ProductResponse | null>(null);
  images = signal<ProductImageResponse[]>([]);
  activeImageUrl = signal<string | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(true);
  addingToCart = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProductDetails(Number(id));
      }
    });
  }

  fetchProductDetails(productId: number): void {
    this.loading.set(true);

    this.productService.getProductById(productId).subscribe({
      next: prod => {
        this.product.set(prod);
        this.loading.set(false);

        // Fetch image gallery
        this.imageService.getImages(productId).subscribe({
          next: imgs => {
            this.images.set(imgs);
            if (imgs && imgs.length > 0) {
              this.activeImageUrl.set(imgs[0].url);
            }
          }
        });
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
      }
    });
  }

  onAddToCart(): void {
    const prod = this.product();
    if (!prod) return;

    this.addingToCart.set(true);
    this.cartService.addItem(prod.id, this.quantity()).subscribe({
      next: () => this.addingToCart.set(false),
      error: () => this.addingToCart.set(false)
    });
  }

  onBuyNow(): void {
    const prod = this.product();
    if (!prod) return;

    this.addingToCart.set(true);
    this.cartService.addItem(prod.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.router.navigate(['/checkout']);
      },
      error: () => this.addingToCart.set(false)
    });
  }
}
