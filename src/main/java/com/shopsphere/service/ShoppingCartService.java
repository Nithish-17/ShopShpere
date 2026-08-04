package com.shopsphere.service;

import com.shopsphere.dto.cart.CartItemRequest;
import com.shopsphere.dto.cart.ShoppingCartResponse;

public interface ShoppingCartService {

    ShoppingCartResponse createCart();

    ShoppingCartResponse addItem(
            CartItemRequest request
    );

    ShoppingCartResponse updateItemQuantity(
            Long productId,
            Integer quantity
    );

    ShoppingCartResponse removeItem(
            Long productId
    );

    ShoppingCartResponse clearCart(
    );

    void emptyCart();
}
