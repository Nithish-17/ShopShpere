import { Component, Input, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductResponse, ProductImageResponse } from '../../../../core/models';
import { ProductImageService } from '../../services/product-image.service';
import { CartService } from '../../../cart/services/cart.service';
import { CurrencyInrPipe } from '../../../../shared/pipes/currency-inr.pipe';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyInrPipe, ImageFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-card">
      <a [routerLink]="['/products', product.id]" class="product-image-container">
        @if (imageUrl()) {
          <img
            [src]="imageUrl()"
            [alt]="product.name"
            class="product-image"
            appImageFallback
            loading="lazy"
          />
        } @else {
          <div class="product-image-placeholder">
            <span class="placeholder-letter">{{ product.name.charAt(0).toUpperCase() }}</span>
          </div>
        }
        <span class="product-category-chip">{{ product.categoryName }}</span>
      </a>

      <div class="product-content">
        <div class="product-meta">
          <span class="product-brand">{{ product.brand }}</span>
        </div>

        <h3 class="product-name">
          <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
        </h3>

        @if (product.description) {
          <p class="product-desc">{{ product.description }}</p>
        }

        <div class="product-footer">
          <div class="product-price">
            {{ product.price | currencyInr }}
          </div>

          <button
            type="button"
            class="btn-add-cart"
            [disabled]="addingToCart()"
            (click)="onAddToCart($event)"
            aria-label="Add to cart"
          >
            @if (addingToCart()) {
              <span class="spinner-inline"></span>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-normal);
      position: relative;
    }

    .product-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-3px);
      border-color: var(--color-border-subtle);
    }

    .product-image-container {
      display: block;
      width: 100%;
      height: 220px;
      background-color: var(--color-bg-muted);
      position: relative;
      overflow: hidden;
      text-decoration: none;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
    }

    .product-card:hover .product-image {
      transform: scale(1.04);
    }

    .product-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f1f5f9;
      color: #94a3b8;
    }

    .placeholder-letter {
      font-size: 3rem;
      font-weight: 800;
      font-family: var(--font-display);
    }

    .product-category-chip {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: var(--shadow-xs);
    }

    .product-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-1);
    }

    .product-brand {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: var(--space-2);
    }

    .product-name a {
      color: var(--color-text-primary);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-name a:hover {
      color: var(--color-accent);
    }

    .product-desc {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: var(--space-4);
      flex: 1;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);
    }

    .product-price {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .btn-add-cart {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-full);
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .btn-add-cart:hover:not(:disabled) {
      background-color: var(--color-accent);
      transform: scale(1.08);
    }

    .btn-add-cart:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-inline {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  `]
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: ProductResponse;

  private readonly imageService = inject(ProductImageService);
  private readonly cartService = inject(CartService);

  imageUrl = signal<string | null>(null);
  addingToCart = signal<boolean>(false);

  ngOnInit(): void {
    if (this.product?.id) {
      this.imageService.getImages(this.product.id).subscribe({
        next: images => {
          if (images && images.length > 0) {
            this.imageUrl.set(images[0].url);
          }
        },
        error: () => {}
      });
    }
  }

  onAddToCart(event: MouseEvent): void {
    event.stopPropagation();
    this.addingToCart.set(true);
    this.cartService.addItem(this.product.id, 1).subscribe({
      next: () => this.addingToCart.set(false),
      error: () => this.addingToCart.set(false)
    });
  }
}
