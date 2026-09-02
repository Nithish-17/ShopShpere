import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CartItemRequest,
  ShoppingCartResponse,
  UpdateCartItemQuantityRequest
} from '../../../core/models';
import { StorageService } from '../../../core/services/storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

const CART_CACHE_KEY = 'shopsphere_cart_cache';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  private readonly _cart = signal<ShoppingCartResponse | null>(this.getInitialCart());
  private readonly _isDrawerOpen = signal<boolean>(false);
  private readonly _loading = signal<boolean>(false);

  readonly cart = this._cart.asReadonly();
  readonly isDrawerOpen = this._isDrawerOpen.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalItems = computed(() => this._cart()?.totalItems ?? 0);
  readonly totalAmount = computed(() => this._cart()?.totalAmount ?? 0);
  readonly items = computed(() => this._cart()?.items ?? []);
  readonly isEmpty = computed(() => (this._cart()?.totalItems ?? 0) === 0);

  constructor() {
    // When auth status drops, reset cart
    if (!this.authService.isAuthenticated()) {
      this.clearLocalCart();
    }
  }

  toggleDrawer(open?: boolean): void {
    if (open !== undefined) {
      this._isDrawerOpen.set(open);
    } else {
      this._isDrawerOpen.update(v => !v);
    }
  }

  addItem(productId: number, quantity = 1): Observable<ShoppingCartResponse | null> {
    if (!this.authService.isAuthenticated()) {
      this.notification.info('Please sign in to add items to your cart.');
      return of(null);
    }

    this._loading.set(true);
    const request: CartItemRequest = { productId, quantity };

    return this.http
      .post<ShoppingCartResponse>(`${environment.apiUrl}/shopping-carts/users/items`, request)
      .pipe(
        tap(response => {
          this.updateCart(response);
          this._loading.set(false);
          this.notification.success('Item added to cart.');
          this.toggleDrawer(true);
        }),
        catchError(err => {
          this._loading.set(false);
          throw err;
        })
      );
  }

  updateQuantity(productId: number, quantity: number): Observable<ShoppingCartResponse> {
    this._loading.set(true);
    const request: UpdateCartItemQuantityRequest = { quantity };

    return this.http
      .patch<ShoppingCartResponse>(
        `${environment.apiUrl}/shopping-carts/users/items/${productId}`,
        request
      )
      .pipe(
        tap(response => {
          this.updateCart(response);
          this._loading.set(false);
        }),
        catchError(err => {
          this._loading.set(false);
          throw err;
        })
      );
  }

  removeItem(productId: number): Observable<ShoppingCartResponse> {
    this._loading.set(true);
    return this.http
      .delete<ShoppingCartResponse>(
        `${environment.apiUrl}/shopping-carts/users/items/${productId}`
      )
      .pipe(
        tap(response => {
          this.updateCart(response);
          this._loading.set(false);
          this.notification.info('Item removed from cart.');
        }),
        catchError(err => {
          this._loading.set(false);
          throw err;
        })
      );
  }

  clearCart(): Observable<ShoppingCartResponse> {
    this._loading.set(true);
    return this.http
      .delete<ShoppingCartResponse>(`${environment.apiUrl}/shopping-carts/users/clear`)
      .pipe(
        tap(response => {
          this.updateCart(response);
          this._loading.set(false);
          this.notification.info('Cart cleared.');
        }),
        catchError(err => {
          this._loading.set(false);
          throw err;
        })
      );
  }

  resetCartAfterOrder(): void {
    const current = this._cart();
    if (current) {
      const emptyCart: ShoppingCartResponse = {
        ...current,
        items: [],
        totalItems: 0,
        totalAmount: 0
      };
      this.updateCart(emptyCart);
    } else {
      this.clearLocalCart();
    }
  }

  private updateCart(cart: ShoppingCartResponse): void {
    this._cart.set(cart);
    this.storage.setItem(CART_CACHE_KEY, cart);
  }

  private clearLocalCart(): void {
    this._cart.set(null);
    this.storage.removeItem(CART_CACHE_KEY);
  }

  private getInitialCart(): ShoppingCartResponse | null {
    return this.storage.getItem<ShoppingCartResponse>(CART_CACHE_KEY);
  }
}
