import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentMethod
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);

  // Customer: Initiate payment for an order
  createPayment(orderId: number, paymentMethod: PaymentMethod): Observable<PaymentResponse> {
    const request: CreatePaymentRequest = { orderId, paymentMethod };
    return this.http.post<PaymentResponse>(`${environment.apiUrl}/payments`, request);
  }

  // Customer: Retry a failed payment
  retryPayment(paymentId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${environment.apiUrl}/payments/${paymentId}`,
      {}
    );
  }

  // Customer: Get my payment history
  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${environment.apiUrl}/payments/me`);
  }

  // Customer & Admin: Lookup payment by reference
  getPaymentByReference(paymentReference: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${environment.apiUrl}/payments/reference/${paymentReference}`
    );
  }

  // Customer: Get payment details for an order
  getPaymentByOrder(orderId: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${environment.apiUrl}/payments/order/${orderId}`
    );
  }

  // Admin: Get all payments ledger
  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${environment.apiUrl}/payments`);
  }

  // Admin: Get failed payments
  getFailedPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${environment.apiUrl}/payments/failed`);
  }
}
