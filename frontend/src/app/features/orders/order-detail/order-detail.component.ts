import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../checkout/services/order.service';
import { PaymentService } from '../../checkout/services/payment.service';
import { OrderResponse, PaymentResponse, OrderStatus } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-detail',
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
    <div class="container order-detail-page">
      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading order details ..."></app-spinner>
      } @else if (!order()) {
        <app-empty-state
          title="Order not found"
          description="Could not find details for the requested order ID."
          actionLabel="Return to My Orders"
          (actionClicked)="router.navigate(['/orders'])"
        ></app-empty-state>
      } @else {
        <!-- Top Back Bar -->
        <div class="back-bar">
          <a routerLink="/orders" class="btn-back">&larr; Back to All Orders</a>
        </div>

        <div class="order-title-header">
          <div>
            <h1 class="order-main-title">Order #{{ order()?.id }}</h1>
            <p class="order-date-text">Placed on {{ order()?.orderDate | dateFormat:'long' }}</p>
          </div>

          <div class="order-badge-wrapper">
            <app-badge [variant]="getStatusBadgeVariant(order()?.status!)" size="md">
              {{ order()?.status }}
            </app-badge>
          </div>
        </div>

        <!-- Order Workflow Visual Progression -->
        <div class="status-tracker-card">
          <div class="tracker-steps">
            <div class="t-step" [class.completed]="isStepCompleted('PENDING')">
              <div class="t-circle">1</div>
              <span class="t-label">Order Placed</span>
            </div>
            <div class="t-line" [class.completed]="isStepCompleted('CONFIRMED')"></div>
            <div class="t-step" [class.completed]="isStepCompleted('CONFIRMED')">
              <div class="t-circle">2</div>
              <span class="t-label">Confirmed</span>
            </div>
            <div class="t-line" [class.completed]="isStepCompleted('PACKED')"></div>
            <div class="t-step" [class.completed]="isStepCompleted('PACKED')">
              <div class="t-circle">3</div>
              <span class="t-label">Packed</span>
            </div>
            <div class="t-line" [class.completed]="isStepCompleted('SHIPPED')"></div>
            <div class="t-step" [class.completed]="isStepCompleted('SHIPPED')">
              <div class="t-circle">4</div>
              <span class="t-label">Shipped</span>
            </div>
            <div class="t-line" [class.completed]="isStepCompleted('DELIVERED')"></div>
            <div class="t-step" [class.completed]="isStepCompleted('DELIVERED')">
              <div class="t-circle">5</div>
              <span class="t-label">Delivered</span>
            </div>
          </div>
        </div>

        <div class="order-content-grid">
          <!-- Items Breakdown -->
          <div class="order-items-column">
            <app-card [padding]="'lg'">
              <h3 class="card-heading">Purchased Items</h3>

              <div class="items-table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order()?.items; track item.id) {
                      <tr>
                        <td>
                          <a [routerLink]="['/products', item.productId]" class="product-link">
                            {{ item.productName }}
                          </a>
                        </td>
                        <td>{{ item.productPrice | currencyInr }}</td>
                        <td>{{ item.quantity }}</td>
                        <td class="font-bold">{{ item.subtotal | currencyInr }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-card>
          </div>

          <!-- Order Summary & Payment Audit -->
          <div class="order-summary-column">
            <app-card [padding]="'lg'">
              <h3 class="card-heading">Payment Information</h3>

              @if (payment()) {
                <div class="payment-audit-box">
                  <div class="p-row">
                    <span class="p-label">Reference</span>
                    <span class="p-val code-font">{{ payment()?.paymentReference }}</span>
                  </div>
                  <div class="p-row">
                    <span class="p-label">Method</span>
                    <span class="p-val">{{ payment()?.paymentMethod }}</span>
                  </div>
                  <div class="p-row">
                    <span class="p-label">Status</span>
                    <app-badge [variant]="payment()?.paymentStatus === 'COMPLETED' ? 'success' : 'danger'">
                      {{ payment()?.paymentStatus }}
                    </app-badge>
                  </div>
                  <div class="p-row">
                    <span class="p-label">Paid Amount</span>
                    <span class="p-val font-bold">{{ payment()?.paidAmount | currencyInr }}</span>
                  </div>
                  @if (payment()?.completedAt) {
                    <div class="p-row">
                      <span class="p-label">Processed At</span>
                      <span class="p-val">{{ payment()?.completedAt | dateFormat:'medium' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="no-payment-box">
                  <p>No successful payment recorded yet for this order.</p>
                  @if (order()?.status === 'PENDING') {
                    <a [routerLink]="['/checkout']" class="btn-pay-now">
                      Complete Payment Now &rarr;
                    </a>
                  }
                </div>
              }

              <div class="divider"></div>

              <div class="total-summary-box">
                <div class="s-row">
                  <span>Items Subtotal</span>
                  <span>{{ order()?.totalAmount | currencyInr }}</span>
                </div>
                <div class="s-row">
                  <span>Shipping</span>
                  <span class="free-text">FREE</span>
                </div>
                <div class="divider"></div>
                <div class="s-row grand-total">
                  <span>Grand Total</span>
                  <span>{{ order()?.totalAmount | currencyInr }}</span>
                </div>
              </div>
            </app-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .order-detail-page {
      padding-top: var(--space-6);
      padding-bottom: var(--space-16);
    }

    .back-bar {
      margin-bottom: var(--space-4);
    }

    .btn-back {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-decoration: none;
    }

    .btn-back:hover {
      color: var(--color-brand);
    }

    .order-title-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .order-main-title {
      font-size: 2rem;
      font-weight: 800;
    }

    .order-date-text {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .status-tracker-card {
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      margin-bottom: var(--space-8);
      box-shadow: var(--shadow-xs);
    }

    .tracker-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 800px;
      margin: 0 auto;
    }

    .t-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
    }

    .t-circle {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background-color: var(--color-bg-muted);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .t-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .t-step.completed {
      color: var(--color-brand);
    }

    .t-step.completed .t-circle {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      border-color: var(--color-brand);
    }

    .t-line {
      flex: 1;
      height: 2px;
      background-color: var(--color-border);
      margin: 0 var(--space-2);
    }

    .t-line.completed {
      background-color: var(--color-brand);
    }

    .order-content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-8);
      align-items: start;
    }

    .card-heading {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: var(--space-4);
    }

    .product-link {
      font-weight: 600;
      color: var(--color-text-primary);
      text-decoration: none;
    }

    .product-link:hover {
      color: var(--color-accent);
    }

    .font-bold {
      font-weight: 700;
    }

    .payment-audit-box {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      background-color: var(--color-bg-muted);
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    .p-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .p-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .p-val {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .code-font {
      font-family: monospace;
    }

    .no-payment-box {
      padding: var(--space-4);
      background-color: var(--color-warning-bg);
      border: 1px solid var(--color-warning-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .btn-pay-now {
      display: inline-block;
      margin-top: var(--space-2);
      font-weight: 700;
      color: #92400e;
      text-decoration: underline;
    }

    .divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-4) 0;
    }

    .total-summary-box {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .s-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .free-text {
      color: var(--color-success);
      font-weight: 700;
    }

    .grand-total {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    @media (max-width: 900px) {
      .order-content-grid {
        grid-template-columns: 1fr;
      }
      .tracker-steps {
        overflow-x: auto;
      }
    }
  `]
})
export default class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);

  order = signal<OrderResponse | null>(null);
  payment = signal<PaymentResponse | null>(null);
  loading = signal<boolean>(true);

  private readonly stepOrder: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'DELIVERED'
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchOrder(Number(id));
      }
    });
  }

  fetchOrder(orderId: number): void {
    this.loading.set(true);

    this.orderService.getOrderById(orderId).subscribe({
      next: ord => {
        this.order.set(ord);
        this.loading.set(false);

        // Fetch payment details
        this.paymentService.getPaymentByOrder(orderId).subscribe({
          next: p => this.payment.set(p),
          error: () => this.payment.set(null)
        });
      },
      error: () => {
        this.order.set(null);
        this.loading.set(false);
      }
    });
  }

  isStepCompleted(status: OrderStatus): boolean {
    const current = this.order()?.status;
    if (!current || current === 'CANCELLED') return false;

    const currentIndex = this.stepOrder.indexOf(current);
    const stepIndex = this.stepOrder.indexOf(status);

    return currentIndex >= stepIndex;
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
}
