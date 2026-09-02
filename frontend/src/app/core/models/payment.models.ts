export type PaymentMethod =
  | 'CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'WALLET'
  | 'CASH_ON_DELIVERY';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  id: number;
  paymentReference: string;
  gatewayTransactionId?: string;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  completedAt?: string;
}
