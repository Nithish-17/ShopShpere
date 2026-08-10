package com.shopsphere.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Getter
@Setter
public class ProductSearchRequest {

    private String keyword;

    private Long categoryId;

    private String brand;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private Boolean inStock;
}
