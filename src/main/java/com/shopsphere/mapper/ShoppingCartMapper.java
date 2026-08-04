package com.shopsphere.mapper;

import com.shopsphere.dto.cart.ShoppingCartResponse;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.ShoppingCart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(
        componentModel = "spring",
        uses = CartItemMapper.class
)
public interface ShoppingCartMapper {

    @Mapping(
            target = "userId",
            source = "user.id"
    )

    @Mapping(
            target = "items",
            source = "cartItems"
    )

    @Mapping(
            target = "totalItems",
            expression =
                    "java(getTotalItems(cart))"
    )

    @Mapping(
            target = "totalAmount",
            expression =
                    "java(getTotalAmount(cart))"
    )
    ShoppingCartResponse toResponse(
            ShoppingCart cart
    );


    default Integer getTotalItems(
            ShoppingCart cart) {

        return cart.getCartItems()
                .stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

    }

    default BigDecimal getTotalAmount(
            ShoppingCart cart) {

        return cart.getCartItems()
                .stream()

                .map(item ->
                        item.getPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                item.getQuantity()
                                        )
                                ))

                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

    }
}
