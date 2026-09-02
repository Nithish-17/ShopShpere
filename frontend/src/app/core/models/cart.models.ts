export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface ShoppingCartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
}
