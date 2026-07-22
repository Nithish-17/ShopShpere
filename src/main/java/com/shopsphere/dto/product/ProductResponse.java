package com.shopsphere.dto.product;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Builder
@Data
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private String brand;

    private BigDecimal price;

    private Long categoryId;

    private String categoryName;

}