import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyInrPipe,
    CardComponent,
    EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container cart-page">
      <div class="cart-header">
        <h1 class="cart-title">Shopping Cart</h1>
        <p class="cart-subtitle">Review items reserved in your session</p>
      </div>

      @if (cartService.isEmpty()) {
        <app-empty-state
          icon="cart"
          title="Your shopping cart is empty"
          description="Looks like you haven't added any products yet. Browse our catalog to find what you need."
          actionLabel="Explore Catalog"
          [actionVariant]="'primary'"
          (actionClicked)="navigateToProducts()"
        ></app-empty-state>
      } @else {
        <div class="cart-grid">
          <!-- Cart Items List -->
          <div class="cart-items-section">
            <div class="items-header-bar">
              <span class="items-count-text">{{ cartService.totalItems() }} Items</span>
              <button
                type="button"
                class="btn-clear-all"
                [disabled]="cartService.loading()"
                (click)="onClearCart()"
              >
                Clear Entire Cart
              </button>
            </div>

            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of cartService.items(); track item.id) {
                    <tr>
                      <td class="col-product">
                        <div class="product-cell">
                          <a [routerLink]="['/products', item.productId]" class="cell-product-name">
                            {{ item.productName }}
                          </a>
                        </div>
                      </td>
                      <td class="col-price">
                        {{ item.price | currencyInr }}
                      </td>
                      <td class="col-quantity">
                        <div class="stepper-box">
                          <button
                            type="button"
                            class="btn-step"
                            [disabled]="item.quantity <= 1 || cartService.loading()"
                            (click)="updateQuantity(item.productId, item.quantity - 1)"
                          >
                            -
                          </button>
                          <span class="stepper-value">{{ item.quantity }}</span>
                          <button
                            type="button"
                            class="btn-step"
                            [disabled]="cartService.loading()"
                            (click)="updateQuantity(item.productId, item.quantity + 1)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td class="col-subtotal font-bold">
                        {{ item.totalPrice | currencyInr }}
                      </td>
                      <td class="col-remove">
                        <button
                          type="button"
                          class="btn-delete"
                          [disabled]="cartService.loading()"
                          (click)="removeItem(item.productId)"
                          aria-label="Remove item"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="advisory-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Items in your cart hold active stock reservations in the inventory service until checkout or removal.</span>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="cart-summary-section">
            <app-card [padding]="'lg'">
              <h3 class="summary-title">Order Summary</h3>

              <div class="summary-breakdown">
                <div class="summary-row">
                  <span class="label">Items Subtotal ({{ cartService.totalItems() }})</span>
                  <span class="val">{{ cartService.totalAmount() | currencyInr }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Shipping</span>
                  <span class="val free-shipping">Free</span>
                </div>
                <div class="summary-row">
                  <span class="label">Estimated Taxes</span>
                  <span class="val">Included</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-total-row">
                  <span class="total-label">Total Amount</span>
                  <span class="total-val">{{ cartService.totalAmount() | currencyInr }}</span>
                </div>
              </div>

              <div class="summary-actions">
                <a routerLink="/checkout" class="btn-checkout-link">
                  Proceed to Checkout &rarr;
                </a>
                <a routerLink="/products" class="btn-continue-shopping">
                  &larr; Continue Shopping
                </a>
              </div>
            </app-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
      padding-top: var(--space-8);
      padding-bottom: var(--space-16);
    }

    .cart-header {
      margin-bottom: var(--space-8);
    }

    .cart-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .cart-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: var(--space-8);
      align-items: start;
    }

    .items-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .items-count-text {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--color-text-primary);
    }

    .btn-clear-all {
      background: none;
      border: none;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-danger);
      cursor: pointer;
    }

    .btn-clear-all:hover:not(:disabled) {
      text-decoration: underline;
    }

    .product-cell {
      max-width: 280px;
    }

    .cell-product-name {
      font-weight: 600;
      color: var(--color-text-primary);
      text-decoration: none;
    }

    .cell-product-name:hover {
      color: var(--color-accent);
    }

    .font-bold {
      font-weight: 700;
    }

    .stepper-box {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background-color: var(--color-bg-surface);
    }

    .btn-step {
      width: 1.75rem;
      height: 1.75rem;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 700;
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

    .stepper-value {
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0 var(--space-2);
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-delete:hover:not(:disabled) {
      color: var(--color-danger);
      background-color: var(--color-danger-bg);
    }

    .advisory-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-6);
      padding: var(--space-4);
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }

    .summary-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: var(--space-4);
    }

    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .free-shipping {
      color: var(--color-success);
      font-weight: 700;
    }

    .summary-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-2) 0;
    }

    .summary-total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .summary-actions {
      margin-top: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .btn-checkout-link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--color-text-inverse);
      background-color: var(--color-brand);
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .btn-checkout-link:hover {
      background-color: var(--color-brand-light);
      transform: translateY(-1px);
    }

    .btn-continue-shopping {
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .btn-continue-shopping:hover {
      color: var(--color-text-primary);
    }

    @media (max-width: 900px) {
      .cart-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export default class CartPageComponent {
  readonly cartService = inject(CartService);

  updateQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity).subscribe();
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeItem(productId).subscribe();
  }

  onClearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  navigateToProducts(): void {
    window.location.href = '/products';
  }
}
