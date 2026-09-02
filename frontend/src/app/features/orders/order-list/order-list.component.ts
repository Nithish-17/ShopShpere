import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../checkout/services/order.service';
import { OrderResponse, OrderStatus } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyInrPipe,
    DateFormatPipe,
    BadgeComponent,
    CardComponent,
    SpinnerComponent,
    EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container orders-page">
      <div class="orders-header">
        <h1 class="orders-title">My Orders</h1>
        <p class="orders-subtitle">Track, review, and manage your purchase history</p>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Retrieving your orders..."></app-spinner>
      } @else if (orders().length === 0) {
        <app-empty-state
          icon="package"
          title="No orders placed yet"
          description="You haven't placed any orders with ShopSphere. Discover products and start shopping today!"
          actionLabel="Browse Products"
          (actionClicked)="navigateToCatalog()"
        ></app-empty-state>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <app-card [padding]="'none'" class="order-card">
              <div class="order-card-header">
                <div class="header-meta">
                  <div>
                    <span class="meta-label">ORDER PLACED</span>
                    <span class="meta-value">{{ order.orderDate | dateFormat:'short' }}</span>
                  </div>
                  <div>
                    <span class="meta-label">TOTAL</span>
                    <span class="meta-value font-bold">{{ order.totalAmount | currencyInr }}</span>
                  </div>
                  <div>
                    <span class="meta-label">ORDER #</span>
                    <span class="meta-value">{{ order.id }}</span>
                  </div>
                </div>

                <div class="header-status">
                  <app-badge [variant]="getStatusBadgeVariant(order.status)">
                    {{ order.status }}
                  </app-badge>
                </div>
              </div>

              <div class="order-card-body">
                <div class="order-items-preview">
                  @for (item of order.items; track item.id) {
                    <div class="preview-item">
                      <div class="item-desc">
                        <span class="item-title">{{ item.productName }}</span>
                        <span class="item-sub">Qty: {{ item.quantity }} &bull; {{ item.productPrice | currencyInr }} each</span>
                      </div>
                      <span class="item-subtotal">{{ item.subtotal | currencyInr }}</span>
                    </div>
                  }
                </div>

                <div class="order-card-actions">
                  <a [routerLink]="['/orders', order.id]" class="btn-order-detail">
                    View Details & Receipt &rarr;
                  </a>

                  @if (order.status === 'PENDING') {
                    <button
                      type="button"
                      class="btn-cancel-order"
                      (click)="cancelOrder(order.id)"
                    >
                      Cancel Order
                    </button>
                  }
                </div>
              </div>
            </app-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page {
      padding-top: var(--space-8);
      padding-bottom: var(--space-16);
    }

    .orders-header {
      margin-bottom: var(--space-8);
    }

    .orders-title {
      font-size: 2rem;
      font-weight: 800;
    }

    .orders-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .order-card {
      overflow: hidden;
    }

    .order-card-header {
      background-color: var(--color-bg-muted);
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .header-meta {
      display: flex;
      gap: var(--space-8);
      flex-wrap: wrap;
    }

    .meta-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 0.125rem;
    }

    .meta-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .font-bold {
      font-weight: 800;
    }

    .order-card-body {
      padding: var(--space-6);
    }

    .order-items-preview {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-desc {
      display: flex;
      flex-direction: column;
    }

    .item-title {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--color-text-primary);
    }

    .item-sub {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }

    .item-subtotal {
      font-weight: 700;
      font-size: 0.9375rem;
    }

    .order-card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-4);
    }

    .btn-order-detail {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-accent);
      text-decoration: none;
    }

    .btn-order-detail:hover {
      text-decoration: underline;
    }

    .btn-cancel-order {
      background: none;
      border: none;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-danger);
      cursor: pointer;
    }

    .btn-cancel-order:hover {
      text-decoration: underline;
    }
  `]
})
export default class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(NotificationService);

  orders = signal<OrderResponse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this pending order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.notification.info(`Order #${orderId} was cancelled.`);
          this.fetchOrders();
        }
      });
    }
  }

  getStatusBadgeVariant(status: OrderStatus): BadgeVariant {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'success';
      case 'PACKED':
      case 'SHIPPED':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  }

  navigateToCatalog(): void {
    window.location.href = '/products';
  }
}
