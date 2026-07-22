package com.shopsphere.dto.product;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotBlank(message = "Brand is required")
    @Size(max = 100)
    private String brand;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private Long categoryId;

}