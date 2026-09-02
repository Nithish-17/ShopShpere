import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../features/cart/services/cart.service';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyInrPipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cartService.isDrawerOpen()) {
      <div class="drawer-backdrop" (click)="cartService.toggleDrawer(false)">
        <div class="drawer-panel" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <div class="header-title">
              <h3>Shopping Cart</h3>
              <span class="items-count">({{ cartService.totalItems() }} items)</span>
            </div>
            <button type="button" class="btn-close" (click)="cartService.toggleDrawer(false)" aria-label="Close cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="drawer-body">
            @if (cartService.isEmpty()) {
              <app-empty-state
                icon="cart"
                title="Your cart is empty"
                description="Explore our catalog and find premium tech essentials."
                actionLabel="Explore Catalog"
                (actionClicked)="navigateToCatalog()"
              ></app-empty-state>
            } @else {
              <div class="cart-items-list">
                @for (item of cartService.items(); track item.id) {
                  <div class="cart-item">
                    <div class="item-info">
                      <h4 class="item-name">{{ item.productName }}</h4>
                      <div class="item-price">{{ item.price | currencyInr }}</div>
                    </div>

                    <div class="item-actions">
                      <div class="quantity-stepper">
                        <button
                          type="button"
                          class="stepper-btn"
                          [disabled]="item.quantity <= 1 || cartService.loading()"
                          (click)="updateQuantity(item.productId, item.quantity - 1)"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span class="quantity-value">{{ item.quantity }}</span>
                        <button
                          type="button"
                          class="stepper-btn"
                          [disabled]="cartService.loading()"
                          (click)="updateQuantity(item.productId, item.quantity + 1)"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        class="btn-remove"
                        [disabled]="cartService.loading()"
                        (click)="removeItem(item.productId)"
                        aria-label="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          @if (!cartService.isEmpty()) {
            <div class="drawer-footer">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-amount">{{ cartService.totalAmount() | currencyInr }}</span>
              </div>
              <p class="reservation-notice">Items are reserved temporarily while in cart.</p>

              <div class="drawer-buttons">
                <a routerLink="/cart" (click)="cartService.toggleDrawer(false)" class="btn-view-cart">
                  View Full Cart
                </a>
                <a routerLink="/checkout" (click)="cartService.toggleDrawer(false)" class="btn-checkout">
                  Checkout Now
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1500;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    .drawer-panel {
      background-color: var(--color-bg-surface);
      width: 100%;
      max-width: 440px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drawer-header {
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-title {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
    }

    .header-title h3 {
      font-size: 1.2rem;
      color: var(--color-text-primary);
    }

    .items-count {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
    }

    .btn-close:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-muted);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6);
    }

    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .cart-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-md);
      gap: var(--space-3);
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-accent);
      margin-top: 0.125rem;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .quantity-stepper {
      display: flex;
      align-items: center;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }

    .stepper-btn {
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      background: none;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-primary);
    }

    .stepper-btn:hover:not(:disabled) {
      background-color: var(--color-bg-muted);
    }

    .stepper-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .quantity-value {
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0 var(--space-2);
    }

    .btn-remove {
      background: none;
      border: none;
      color: var(--color-danger);
      cursor: pointer;
      padding: var(--space-1);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
    }

    .btn-remove:hover {
      background-color: var(--color-danger-bg);
    }

    .drawer-footer {
      padding: var(--space-5) var(--space-6);
      border-top: 1px solid var(--color-border);
      background-color: var(--color-bg-surface);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--space-1);
    }

    .summary-label {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .summary-amount {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .reservation-notice {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .drawer-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .btn-view-cart,
    .btn-checkout {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.625rem 1rem;
      font-weight: 600;
      font-size: 0.9375rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .btn-view-cart {
      background-color: var(--color-bg-muted);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-view-cart:hover {
      background-color: #e2e8f0;
    }

    .btn-checkout {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
    }

    .btn-checkout:hover {
      background-color: var(--color-brand-light);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);

  updateQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity).subscribe();
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeItem(productId).subscribe();
  }

  navigateToCatalog(): void {
    this.cartService.toggleDrawer(false);
  }
}
