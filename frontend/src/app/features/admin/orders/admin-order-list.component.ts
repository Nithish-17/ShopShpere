import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../checkout/services/order.service';
import { OrderResponse, OrderStatus } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyInrPipe,
    DateFormatPipe,
    BadgeComponent,
    SpinnerComponent,
    PaginationComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-orders-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Orders & Fulfillment Console</h1>
          <p class="page-subtitle">Track status workflows, transition shipments, and process customer orders</p>
        </div>

        <!-- Filter by Status -->
        <div class="status-filter-wrapper">
          <label for="statusFilter" class="filter-label">Filter by Status:</label>
          <select
            id="statusFilter"
            class="form-select filter-select"
            [ngModel]="selectedStatus()"
            (ngModelChange)="onStatusFilterChange($event)"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading customer orders..."></app-spinner>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>User ID</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/orders', order.id]" class="order-id-link">
                      #{{ order.id }}
                    </a>
                  </td>
                  <td>User {{ order.userId }}</td>
                  <td>{{ order.orderDate | dateFormat:'short' }}</td>
                  <td>{{ order.items.length }} line items</td>
                  <td class="font-bold">{{ order.totalAmount | currencyInr }}</td>
                  <td>
                    <app-badge [variant]="getStatusBadgeVariant(order.status)">
                      {{ order.status }}
                    </app-badge>
                  </td>
                  <td>
                    <select
                      class="form-select status-select"
                      [ngModel]="order.status"
                      [disabled]="updatingId() === order.id"
                      (ngModelChange)="onUpdateStatus(order.id, $event)"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <a [routerLink]="['/orders', order.id]" class="btn-inspect">
                      Inspect &rarr;
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></app-pagination>
      }
    </div>
  `,
  styles: [`
    .admin-orders-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
    }

    .page-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .status-filter-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    .filter-select {
      width: auto;
      padding: 0.5rem 2rem 0.5rem 0.875rem;
      font-size: 0.875rem;
    }

    .order-id-link {
      font-weight: 700;
      color: var(--color-accent);
      text-decoration: none;
    }

    .font-bold {
      font-weight: 700;
    }

    .status-select {
      width: auto;
      padding: 0.25rem 1.75rem 0.25rem 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .btn-inspect {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-brand);
      text-decoration: none;
    }

    .btn-inspect:hover {
      text-decoration: underline;
    }
  `]
})
export default class AdminOrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(NotificationService);

  orders = signal<OrderResponse[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  selectedStatus = signal<string>('ALL');

  loading = signal<boolean>(true);
  updatingId = signal<number | null>(null);

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading.set(true);
    const status = this.selectedStatus();

    const request$ = status === 'ALL'
      ? this.orderService.getAllOrders(this.currentPage(), 12)
      : this.orderService.getOrdersByStatus(status as OrderStatus, this.currentPage(), 12);

    request$.subscribe({
      next: page => {
        this.orders.set(page.content || []);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.fetchOrders();
  }

  onUpdateStatus(orderId: number, newStatus: OrderStatus): void {
    this.updatingId.set(orderId);
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.notification.success(`Order #${orderId} status updated to ${newStatus}.`);
        this.fetchOrders();
      },
      error: () => this.updatingId.set(null)
    });
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchOrders();
  }
}
