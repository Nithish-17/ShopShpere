export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  items: OrderItemResponse[];
}
