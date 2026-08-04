package com.shopsphere.mapper;

import com.shopsphere.dto.cart.CartItemResponse;
import com.shopsphere.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(
            target = "totalPrice",
            expression =
                    "java(cartItem.getPrice().multiply(java.math.BigDecimal.valueOf(cartItem.getQuantity())))"
    )
    CartItemResponse toResponse(CartItem cartItem);

}