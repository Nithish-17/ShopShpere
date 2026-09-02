import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InventoryRequest,
  InventoryResponse,
  StockUpdateRequest
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AdminInventoryService {
  private readonly http = inject(HttpClient);

  createInventory(request: InventoryRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`${environment.apiUrl}/inventory`, request);
  }

  increaseStock(productId: number, quantity: number): Observable<InventoryResponse> {
    const request: StockUpdateRequest = { quantity };
    return this.http.patch<InventoryResponse>(
      `${environment.apiUrl}/inventory/products/${productId}/increase`,
      request
    );
  }

  decreaseStock(productId: number, quantity: number): Observable<InventoryResponse> {
    const request: StockUpdateRequest = { quantity };
    return this.http.patch<InventoryResponse>(
      `${environment.apiUrl}/inventory/products/${productId}/decrease`,
      request
    );
  }

  reserveStock(productId: number, quantity: number): Observable<InventoryResponse> {
    const request: StockUpdateRequest = { quantity };
    return this.http.patch<InventoryResponse>(
      `${environment.apiUrl}/inventory/products/${productId}/reserve`,
      request
    );
  }

  releaseStock(productId: number, quantity: number): Observable<InventoryResponse> {
    const request: StockUpdateRequest = { quantity };
    return this.http.patch<InventoryResponse>(
      `${environment.apiUrl}/inventory/products/${productId}/release`,
      request
    );
  }

  confirmReservation(productId: number, quantity: number): Observable<InventoryResponse> {
    const request: StockUpdateRequest = { quantity };
    return this.http.patch<InventoryResponse>(
      `${environment.apiUrl}/inventory/products/${productId}/confirm`,
      request
    );
  }
}
