import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrderResponse, OrderStatus, Page } from '../../../core/models';
import { CartService } from '../../cart/services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);

  // Customer: Create order from current user cart
  createOrder(): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${environment.apiUrl}/orders`, {}).pipe(
      tap(() => {
        // Backend empties cart upon order creation
        this.cartService.resetCartAfterOrder();
      })
    );
  }

  // Customer & Admin: Get order by ID
  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${environment.apiUrl}/orders/${orderId}`);
  }

  // Customer: Get current user's orders
  getUserOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${environment.apiUrl}/orders/user`);
  }

  // Customer & Admin: Cancel order
  cancelOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/orders/${orderId}`);
  }

  // Admin: Update order status workflow
  updateOrderStatus(orderId: number, status: OrderStatus): Observable<OrderResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<OrderResponse>(
      `${environment.apiUrl}/orders/${orderId}/status`,
      {},
      { params }
    );
  }

  // Admin: Get all orders (paginated)
  getAllOrders(page = 0, size = 15, sort = 'orderDate,desc'): Observable<Page<OrderResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<OrderResponse>>(`${environment.apiUrl}/orders`, { params });
  }

  // Admin: Get orders by status (paginated)
  getOrdersByStatus(
    status: OrderStatus,
    page = 0,
    size = 15,
    sort = 'orderDate,desc'
  ): Observable<Page<OrderResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<OrderResponse>>(
      `${environment.apiUrl}/orders/status/${status}`,
      { params }
    );
  }

  // Admin: Get orders by user ID (paginated)
  getOrdersByUser(
    userId: number,
    page = 0,
    size = 15,
    sort = 'orderDate,desc'
  ): Observable<Page<OrderResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<OrderResponse>>(
      `${environment.apiUrl}/orders/user/${userId}/page`,
      { params }
    );
  }
}
