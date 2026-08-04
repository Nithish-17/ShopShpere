package com.shopsphere.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ShoppingCartResponse {

    private Long id;

    private Long userId;

    private List<CartItemResponse> items;

    private Integer totalItems;

    private BigDecimal totalAmount;

}
