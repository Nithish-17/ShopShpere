package com.shopsphere.controller;

import com.shopsphere.dto.cart.CartItemRequest;
import com.shopsphere.dto.cart.ShoppingCartResponse;
import com.shopsphere.dto.cart.UpdateCartItemQuantityRequest;
import com.shopsphere.service.ShoppingCartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shopping-carts")
public class ShoppingCartController {

    private final ShoppingCartService shoppingCartService;

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingCartResponse createCart() {

        return shoppingCartService
                .createCart();
    }

    @PostMapping("/users/items")
    public ShoppingCartResponse addItem(
            @Valid @RequestBody CartItemRequest request) {

        return shoppingCartService.addItem(
                request
        );
    }

    @PatchMapping("/users/{userId}/items/{productId}")
    public ShoppingCartResponse updateItemQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemQuantityRequest request) {

        return shoppingCartService.updateItemQuantity(
                productId,
                request.getQuantity()
        );
    }

    @DeleteMapping(
            "/users/{userId}/items/{productId}"
    )
    public ShoppingCartResponse removeItem(
            @PathVariable Long productId) {

        return shoppingCartService.removeItem(
                productId
        );
    }

    @DeleteMapping("/users/{userId}/clear")
    public ShoppingCartResponse clearCart() {

        return shoppingCartService.clearCart();

    }

    
}
