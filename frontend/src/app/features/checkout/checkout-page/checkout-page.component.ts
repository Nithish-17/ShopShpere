import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart/services/cart.service';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { OrderResponse, PaymentResponse, PaymentMethod } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { NotificationService } from '../../../core/services/notification.service';

type CheckoutStep = 'review' | 'payment' | 'success' | 'failed';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyInrPipe,
    ButtonComponent,
    CardComponent,
    BadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container checkout-page">
      <div class="checkout-header">
        <h1 class="checkout-title">Secure Checkout</h1>
        <!-- Progress Steps Bar -->
        <div class="steps-bar">
          <div class="step-item" [class.active]="step() === 'review'" [class.done]="step() !== 'review'">
            <span class="step-circle">1</span>
            <span class="step-name">Review & Order</span>
          </div>
          <div class="step-connector" [class.done]="step() !== 'review'"></div>
          <div class="step-item" [class.active]="step() === 'payment'" [class.done]="step() === 'success'">
            <span class="step-circle">2</span>
            <span class="step-name">Payment</span>
          </div>
          <div class="step-connector" [class.done]="step() === 'success'"></div>
          <div class="step-item" [class.active]="step() === 'success' || step() === 'failed'">
            <span class="step-circle">3</span>
            <span class="step-name">Confirmation</span>
          </div>
        </div>
      </div>

      <!-- STEP 1: REVIEW & PLACE ORDER -->
      @if (step() === 'review') {
        <div class="checkout-grid">
          <div class="checkout-main">
            <app-card [padding]="'lg'">
              <h3 class="card-heading">1. Shipping Address & Contact</h3>
              <p class="section-subtext">Delivery to your verified account address</p>

              <div class="address-preview-box">
                <div class="address-tag">Standard Home Delivery (Express 2-3 Days)</div>
                <p class="address-details">
                  Verified Customer Account<br />
                  Signature Required on Delivery<br />
                  Shipping Fees: <strong>FREE</strong>
                </p>
              </div>

              <div class="divider"></div>

              <h3 class="card-heading">2. Order Items Review</h3>
              <div class="order-items-table">
                @for (item of cartService.items(); track item.id) {
                  <div class="order-item-row">
                    <div class="item-name-qty">
                      <span class="item-name">{{ item.productName }}</span>
                      <span class="item-qty">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="item-total">{{ item.totalPrice | currencyInr }}</span>
                  </div>
                }
              </div>
            </app-card>
          </div>

          <div class="checkout-sidebar">
            <app-card [padding]="'lg'">
              <h3 class="summary-heading">Order Total</h3>

              <div class="summary-rows">
                <div class="row">
                  <span>Subtotal</span>
                  <span>{{ cartService.totalAmount() | currencyInr }}</span>
                </div>
                <div class="row">
                  <span>Delivery</span>
                  <span class="free-text">FREE</span>
                </div>
                <div class="row">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
                <div class="divider"></div>
                <div class="total-row">
                  <span>Total Amount</span>
                  <span>{{ cartService.totalAmount() | currencyInr }}</span>
                </div>
              </div>

              <div class="action-wrapper">
                <app-button
                  variant="primary"
                  size="lg"
                  [loading]="isPlacingOrder()"
                  (clicked)="placeOrder()"
                  class="w-full"
                >
                  Place Order & Pay &rarr;
                </app-button>
              </div>
            </app-card>
          </div>
        </div>
      }

      <!-- STEP 2: PAYMENT METHOD SELECTION -->
      @if (step() === 'payment') {
        <div class="checkout-grid single-col-center">
          <app-card [padding]="'lg'" class="payment-card">
            <div class="payment-header">
              <span class="order-tag">Order #{{ currentOrder()?.id }}</span>
              <h2 class="payment-title">Select Payment Method</h2>
              <p class="payment-amount-display">
                Total Payable: <strong>{{ currentOrder()?.totalAmount | currencyInr }}</strong>
              </p>
            </div>

            <div class="payment-methods-list">
              <label class="payment-method-option" [class.selected]="selectedPaymentMethod() === 'CARD'">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  [ngModel]="selectedPaymentMethod()"
                  (ngModelChange)="selectedPaymentMethod.set($event)"
                />
                <div class="method-info">
                  <div class="method-name">Credit / Debit Card</div>
                  <div class="method-desc">Visa, Mastercard, RuPay, Maestro</div>
                </div>
              </label>

              <label class="payment-method-option" [class.selected]="selectedPaymentMethod() === 'UPI'">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  [ngModel]="selectedPaymentMethod()"
                  (ngModelChange)="selectedPaymentMethod.set($event)"
                />
                <div class="method-info">
                  <div class="method-name">UPI / Instant QR</div>
                  <div class="method-desc">Google Pay, PhonePe, Paytm, BHIM</div>
                </div>
              </label>

              <label class="payment-method-option" [class.selected]="selectedPaymentMethod() === 'NET_BANKING'">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="NET_BANKING"
                  [ngModel]="selectedPaymentMethod()"
                  (ngModelChange)="selectedPaymentMethod.set($event)"
                />
                <div class="method-info">
                  <div class="method-name">Net Banking</div>
                  <div class="method-desc">All major Indian banking partners</div>
                </div>
              </label>

              <label class="payment-method-option" [class.selected]="selectedPaymentMethod() === 'WALLET'">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WALLET"
                  [ngModel]="selectedPaymentMethod()"
                  (ngModelChange)="selectedPaymentMethod.set($event)"
                />
                <div class="method-info">
                  <div class="method-name">Digital Wallet</div>
                  <div class="method-desc">Amazon Pay, Mobikwik, Airtel Money</div>
                </div>
              </label>

              <label class="payment-method-option" [class.selected]="selectedPaymentMethod() === 'CASH_ON_DELIVERY'">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  [ngModel]="selectedPaymentMethod()"
                  (ngModelChange)="selectedPaymentMethod.set($event)"
                />
                <div class="method-info">
                  <div class="method-name">Cash on Delivery</div>
                  <div class="method-desc">Pay upon physical package handover</div>
                </div>
              </label>
            </div>

            <div class="gateway-note">
              <span>⚡ Simulated Gateway Environment: 80% Success, 20% Insufficient Funds</span>
            </div>

            <div class="payment-actions">
              <app-button
                variant="primary"
                size="lg"
                [loading]="isProcessingPayment()"
                (clicked)="processPayment()"
                class="w-full"
              >
                Authorize & Pay {{ currentOrder()?.totalAmount | currencyInr }}
              </app-button>
            </div>
          </app-card>
        </div>
      }

      <!-- STEP 3A: PAYMENT SUCCESSFUL -->
      @if (step() === 'success') {
        <div class="checkout-result-box success">
          <div class="result-icon success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 class="result-title">Payment Confirmed!</h2>
          <p class="result-subtitle">Thank you for your order. Your transaction was processed successfully.</p>

          <div class="result-receipt-card">
            <div class="receipt-row">
              <span class="r-label">Order Number:</span>
              <span class="r-val">#{{ currentOrder()?.id }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Payment Reference:</span>
              <span class="r-val code-font">{{ currentPayment()?.paymentReference }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Amount Paid:</span>
              <span class="r-val font-bold">{{ currentPayment()?.paidAmount | currencyInr }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Payment Method:</span>
              <span class="r-val">{{ currentPayment()?.paymentMethod }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Status:</span>
              <app-badge variant="success">CONFIRMED</app-badge>
            </div>
          </div>

          <div class="email-notice">
            📧 An automated invoice with PDF attachment has been dispatched to your email address.
          </div>

          <div class="result-actions">
            <a [routerLink]="['/orders']" class="btn-result-primary">
              View Order Details &rarr;
            </a>
            <a routerLink="/products" class="btn-result-secondary">
              Continue Shopping
            </a>
          </div>
        </div>
      }

      <!-- STEP 3B: PAYMENT FAILED -->
      @if (step() === 'failed') {
        <div class="checkout-result-box failed">
          <div class="result-icon failed-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 class="result-title">Payment Authorization Failed</h2>
          <p class="result-subtitle">
            The simulated payment gateway returned <strong>INSUFFICIENT_FUNDS</strong> (20% simulation trigger).
          </p>

          <div class="result-receipt-card">
            <div class="receipt-row">
              <span class="r-label">Order Number:</span>
              <span class="r-val">#{{ currentOrder()?.id }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Attempt Reference:</span>
              <span class="r-val code-font">{{ currentPayment()?.paymentReference }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Status:</span>
              <app-badge variant="danger">FAILED</app-badge>
            </div>
          </div>

          <p class="retry-hint">You can retry the transaction immediately or choose a different payment method.</p>

          <div class="result-actions">
            <app-button
              variant="primary"
              size="lg"
              [loading]="isProcessingPayment()"
              (clicked)="retryPayment()"
            >
              Retry Payment Now
            </app-button>
            <app-button
              variant="secondary"
              size="lg"
              (clicked)="step.set('payment')"
            >
              Change Payment Method
            </app-button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      padding-top: var(--space-8);
      padding-bottom: var(--space-16);
    }

    .checkout-header {
      margin-bottom: var(--space-8);
    }

    .checkout-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: var(--space-6);
    }

    .steps-bar {
      display: flex;
      align-items: center;
      max-width: 600px;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
    }

    .step-circle {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: var(--color-bg-muted);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .step-name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .step-item.active {
      color: var(--color-brand);
    }

    .step-item.active .step-circle {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      border-color: var(--color-brand);
    }

    .step-item.done {
      color: var(--color-success);
    }

    .step-item.done .step-circle {
      background-color: var(--color-success-bg);
      color: var(--color-success);
      border-color: var(--color-success-border);
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background-color: var(--color-border);
      margin: 0 var(--space-3);
    }

    .step-connector.done {
      background-color: var(--color-success);
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-8);
      align-items: start;
    }

    .single-col-center {
      grid-template-columns: 1fr;
      max-width: 580px;
      margin: 0 auto;
    }

    .card-heading {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: var(--space-1);
    }

    .section-subtext {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
    }

    .address-preview-box {
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-md);
      padding: var(--space-4);
    }

    .address-tag {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-brand);
      margin-bottom: var(--space-1);
    }

    .address-details {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-5) 0;
    }

    .order-items-table {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .order-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2) 0;
    }

    .item-name-qty {
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--color-text-primary);
    }

    .item-qty {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .item-total {
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .summary-heading {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: var(--space-4);
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .free-text {
      color: var(--color-success);
      font-weight: 700;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .action-wrapper {
      margin-top: var(--space-6);
    }

    .w-full { width: 100%; display: block; }
    .w-full button { width: 100%; }

    .payment-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .order-tag {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .payment-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin: var(--space-1) 0;
    }

    .payment-amount-display {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
    }

    .payment-methods-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .payment-method-option {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .payment-method-option:hover {
      border-color: var(--color-border-subtle);
      background-color: var(--color-bg-muted);
    }

    .payment-method-option.selected {
      border-color: var(--color-brand);
      background-color: #f8fafc;
      box-shadow: 0 0 0 1px var(--color-brand);
    }

    .payment-method-option input {
      accent-color: var(--color-brand);
      width: 1.25rem;
      height: 1.25rem;
    }

    .method-name {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--color-text-primary);
    }

    .method-desc {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .gateway-note {
      padding: var(--space-3);
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-align: center;
      margin-bottom: var(--space-6);
    }

    /* Result Views */
    .checkout-result-box {
      max-width: 600px;
      margin: var(--space-4) auto;
      background-color: var(--color-bg-surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      padding: var(--space-10) var(--space-8);
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .result-icon {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
    }

    .success-icon {
      background-color: var(--color-success-bg);
      color: var(--color-success);
    }

    .failed-icon {
      background-color: var(--color-danger-bg);
      color: var(--color-danger);
    }

    .result-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: var(--space-2);
    }

    .result-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-6);
    }

    .result-receipt-card {
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-6);
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .r-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .r-val {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .code-font {
      font-family: monospace;
      font-size: 0.8125rem;
    }

    .email-notice {
      font-size: 0.8125rem;
      color: #0369a1;
      background-color: var(--color-info-bg);
      border: 1px solid var(--color-info-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .retry-hint {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .result-actions {
      display: flex;
      justify-content: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .btn-result-primary,
    .btn-result-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .btn-result-primary {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
    }

    .btn-result-primary:hover {
      background-color: var(--color-brand-light);
    }

    .btn-result-secondary {
      background-color: var(--color-bg-muted);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-result-secondary:hover {
      background-color: #e2e8f0;
    }

    @media (max-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export default class CheckoutPageComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  step = signal<CheckoutStep>('review');
  selectedPaymentMethod = signal<PaymentMethod>('CARD');
  currentOrder = signal<OrderResponse | null>(null);
  currentPayment = signal<PaymentResponse | null>(null);

  isPlacingOrder = signal<boolean>(false);
  isProcessingPayment = signal<boolean>(false);

  ngOnInit(): void {
    if (this.cartService.isEmpty()) {
      this.router.navigate(['/cart']);
    }
  }

  placeOrder(): void {
    this.isPlacingOrder.set(true);

    this.orderService.createOrder().subscribe({
      next: order => {
        this.currentOrder.set(order);
        this.isPlacingOrder.set(false);
        this.step.set('payment');
      },
      error: () => {
        this.isPlacingOrder.set(false);
      }
    });
  }

  processPayment(): void {
    const order = this.currentOrder();
    if (!order) return;

    this.isProcessingPayment.set(true);

    this.paymentService.createPayment(order.id, this.selectedPaymentMethod()).subscribe({
      next: payment => {
        this.currentPayment.set(payment);
        this.isProcessingPayment.set(false);

        if (payment.paymentStatus === 'COMPLETED') {
          this.step.set('success');
          this.notification.success('Payment completed successfully!');
        } else {
          this.step.set('failed');
          this.notification.warning('Payment authorization was unsuccessful.');
        }
      },
      error: () => {
        this.isProcessingPayment.set(false);
      }
    });
  }

  retryPayment(): void {
    const payment = this.currentPayment();
    if (!payment) return;

    this.isProcessingPayment.set(true);

    this.paymentService.retryPayment(payment.id).subscribe({
      next: updatedPayment => {
        this.currentPayment.set(updatedPayment);
        this.isProcessingPayment.set(false);

        if (updatedPayment.paymentStatus === 'COMPLETED') {
          this.step.set('success');
          this.notification.success('Retry successful! Payment confirmed.');
        } else {
          this.step.set('failed');
          this.notification.error('Retry unsuccessful. Please try another payment method.');
        }
      },
      error: () => {
        this.isProcessingPayment.set(false);
      }
    });
  }
}
