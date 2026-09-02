import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../checkout/services/payment.service';
import { PaymentResponse } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyInrPipe,
    DateFormatPipe,
    BadgeComponent,
    SpinnerComponent,
    EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-payments-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payment Audit Ledger</h1>
          <p class="page-subtitle">Inspect simulated gateway transactions, audit references, and review failure traces</p>
        </div>

        <div class="filter-controls">
          <!-- Reference Search -->
          <div class="search-ref-box">
            <input
              type="text"
              class="form-control ref-input"
              placeholder="Search reference..."
              [ngModel]="searchRef()"
              (ngModelChange)="searchRef.set($event)"
              (keyup.enter)="searchByReference()"
            />
            <button type="button" class="btn-ref-search" (click)="searchByReference()">Lookup</button>
          </div>

          <!-- Failed Only Filter Toggle -->
          <button
            type="button"
            class="btn-toggle-failed"
            [class.active]="showFailedOnly()"
            (click)="toggleFailedFilter()"
          >
            {{ showFailedOnly() ? 'Show All Transactions' : 'Show Failed Only' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading transaction records..."></app-spinner>
      } @else if (payments().length === 0) {
        <app-empty-state
          title="No transaction records found"
          description="Try clearing your lookup query or filter."
          actionLabel="View All Payments"
          (actionClicked)="resetList()"
        ></app-empty-state>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Payment Reference</th>
                <th>Gateway Txn ID</th>
                <th>Method</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              @for (pay of payments(); track pay.id) {
                <tr>
                  <td>#{{ pay.id }}</td>
                  <td class="font-mono">{{ pay.paymentReference }}</td>
                  <td class="font-mono text-muted">{{ pay.gatewayTransactionId || 'N/A' }}</td>
                  <td>
                    <span class="method-tag">{{ pay.paymentMethod }}</span>
                  </td>
                  <td class="font-bold">{{ pay.paidAmount | currencyInr }}</td>
                  <td>
                    <app-badge [variant]="pay.paymentStatus === 'COMPLETED' ? 'success' : 'danger'">
                      {{ pay.paymentStatus }}
                    </app-badge>
                  </td>
                  <td>{{ pay.completedAt | dateFormat:'medium' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-payments-page {
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

    .filter-controls {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .search-ref-box {
      display: flex;
      align-items: center;
    }

    .ref-input {
      width: 200px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      font-size: 0.875rem;
      padding: 0.45rem 0.75rem;
    }

    .btn-ref-search {
      padding: 0.45rem 0.875rem;
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      border: 1px solid var(--color-brand);
      border-top-right-radius: var(--radius-md);
      border-bottom-right-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-toggle-failed {
      padding: 0.45rem 0.875rem;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-toggle-failed:hover {
      border-color: var(--color-brand);
      color: var(--color-brand);
    }

    .btn-toggle-failed.active {
      background-color: var(--color-danger-bg);
      border-color: var(--color-danger-border);
      color: var(--color-danger);
    }

    .font-mono {
      font-family: monospace;
      font-size: 0.8125rem;
    }

    .text-muted {
      color: var(--color-text-muted);
    }

    .font-bold {
      font-weight: 700;
    }

    .method-tag {
      font-weight: 600;
      font-size: 0.8125rem;
      background-color: var(--color-bg-muted);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
  `]
})
export default class AdminPaymentListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  payments = signal<PaymentResponse[]>([]);
  loading = signal<boolean>(true);
  showFailedOnly = signal<boolean>(false);
  searchRef = signal<string>('');

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.loading.set(true);

    const request$ = this.showFailedOnly()
      ? this.paymentService.getFailedPayments()
      : this.paymentService.getAllPayments();

    request$.subscribe({
      next: list => {
        this.payments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  searchByReference(): void {
    const ref = this.searchRef().trim();
    if (!ref) {
      this.fetchPayments();
      return;
    }

    this.loading.set(true);
    this.paymentService.getPaymentByReference(ref).subscribe({
      next: payment => {
        this.payments.set(payment ? [payment] : []);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      }
    });
  }

  toggleFailedFilter(): void {
    this.showFailedOnly.update(v => !v);
    this.searchRef.set('');
    this.fetchPayments();
  }

  resetList(): void {
    this.showFailedOnly.set(false);
    this.searchRef.set('');
    this.fetchPayments();
  }
}
