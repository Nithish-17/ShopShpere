import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../checkout/services/payment.service';
import { PaymentResponse } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyInrPipe,
    DateFormatPipe,
    BadgeComponent,
    SpinnerComponent,
    EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container payments-page">
      <div class="payments-header">
        <h1 class="payments-title">Payment History</h1>
        <p class="payments-subtitle">Audit and receipts for all transactions associated with your account</p>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Retrieving transaction ledger..."></app-spinner>
      } @else if (payments().length === 0) {
        <app-empty-state
          title="No payments recorded"
          description="Your transaction ledger will appear here after completing your first purchase."
          actionLabel="Go to Catalog"
          (actionClicked)="navigateToProducts()"
        ></app-empty-state>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Gateway Txn ID</th>
                <th>Method</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              @for (pay of payments(); track pay.id) {
                <tr>
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
    .payments-page {
      padding-top: var(--space-8);
      padding-bottom: var(--space-16);
    }

    .payments-header {
      margin-bottom: var(--space-8);
    }

    .payments-title {
      font-size: 2rem;
      font-weight: 800;
    }

    .payments-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
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
export default class PaymentListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  payments = signal<PaymentResponse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.paymentService.getMyPayments().subscribe({
      next: list => {
        this.payments.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  navigateToProducts(): void {
    window.location.href = '/products';
  }
}
