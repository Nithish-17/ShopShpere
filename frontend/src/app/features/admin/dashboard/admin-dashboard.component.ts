import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../products/services/product.service';
import { CategoryService } from '../../products/services/category.service';
import { OrderService } from '../../checkout/services/order.service';
import { PaymentService } from '../../checkout/services/payment.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-dashboard">
      <div class="dash-header">
        <h1 class="dash-title">Store Overview</h1>
        <p class="dash-subtitle">Real-time metrics and administration quick-actions</p>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading dashboard statistics..."></app-spinner>
      } @else {
        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div class="metric-data">
              <span class="metric-label">Total Products</span>
              <span class="metric-value">{{ totalProducts() }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </div>
            <div class="metric-data">
              <span class="metric-label">Categories</span>
              <span class="metric-value">{{ totalCategories() }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="metric-data">
              <span class="metric-label">Total Orders</span>
              <span class="metric-value">{{ totalOrders() }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <div class="metric-data">
              <span class="metric-label">Failed Payments</span>
              <span class="metric-value">{{ totalFailedPayments() }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Access Navigation Grid -->
        <div class="quick-actions-grid">
          <app-card [padding]="'lg'" [interactive]="true" class="action-card">
            <div class="action-content">
              <h3>Product Management</h3>
              <p>Create products, update pricing, assign categories, and manage media galleries.</p>
              <a routerLink="/admin/products" class="card-btn">Manage Products &rarr;</a>
            </div>
          </app-card>

          <app-card [padding]="'lg'" [interactive]="true" class="action-card">
            <div class="action-content">
              <h3>Category Hierarchy</h3>
              <p>Organize products into intuitive taxonomies and catalog departments.</p>
              <a routerLink="/admin/categories" class="card-btn">Manage Categories &rarr;</a>
            </div>
          </app-card>

          <app-card [padding]="'lg'" [interactive]="true" class="action-card">
            <div class="action-content">
              <h3>Inventory Control</h3>
              <p>Adjust stock levels, initialize safety thresholds, and monitor reserve quantities.</p>
              <a routerLink="/admin/inventory" class="card-btn">Adjust Stock Levels &rarr;</a>
            </div>
          </app-card>

          <app-card [padding]="'lg'" [interactive]="true" class="action-card">
            <div class="action-content">
              <h3>Fulfillment & Orders</h3>
              <p>Transition order state machine (PENDING &rarr; CONFIRMED &rarr; PACKED &rarr; SHIPPED &rarr; DELIVERED).</p>
              <a routerLink="/admin/orders" class="card-btn">Fulfill Orders &rarr;</a>
            </div>
          </app-card>

          <app-card [padding]="'lg'" [interactive]="true" class="action-card">
            <div class="action-content">
              <h3>Payment Audit Ledger</h3>
              <p>Inspect simulated gateway transactions, audit references, and review failure traces.</p>
              <a routerLink="/admin/payments" class="card-btn">Inspect Payments &rarr;</a>
            </div>
          </app-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .dash-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .dash-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-6);
    }

    .metric-card {
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-xs);
    }

    .metric-icon-box {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-icon-box.blue { background-color: #eff6ff; color: #2563eb; }
    .metric-icon-box.purple { background-color: #faf5ff; color: #9333ea; }
    .metric-icon-box.green { background-color: #ecfdf5; color: #059669; }
    .metric-icon-box.amber { background-color: #fffbeb; color: #d97706; }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.1;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-6);
    }

    .action-content h3 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: var(--space-2);
    }

    .action-content p {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-4);
    }

    .card-btn {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-accent);
      text-decoration: none;
    }

    .card-btn:hover {
      text-decoration: underline;
    }
  `]
})
export default class AdminDashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);

  totalProducts = signal<number>(0);
  totalCategories = signal<number>(0);
  totalOrders = signal<number>(0);
  totalFailedPayments = signal<number>(0);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.productService.getProducts(0, 1).subscribe({
      next: page => this.totalProducts.set(page.totalElements),
      error: () => {}
    });

    this.categoryService.getAllCategories().subscribe({
      next: cats => this.totalCategories.set(cats.length),
      error: () => {}
    });

    this.orderService.getAllOrders(0, 1).subscribe({
      next: page => this.totalOrders.set(page.totalElements),
      error: () => {}
    });

    this.paymentService.getFailedPayments().subscribe({
      next: failed => {
        this.totalFailedPayments.set(failed.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
