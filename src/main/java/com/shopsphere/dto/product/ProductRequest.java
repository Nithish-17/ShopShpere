package com.shopsphere.dto.product;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Data
@Schema(
        name = "Product Request",
        description = "Request object used to create or update a product"
)
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    @Schema(
            description = "Product Name",
            example = "iphone 16"
    )
    private String name;

    @Size(max = 1000)
    @Schema(
            description = "Product Description",
            example = "Apple flagship smartphone"
    )
    private String description;

    @NotBlank(message = "Brand is required")
    @Size(max = 100)
    @Schema(
            description = "Product brand",
            example = "Apple"
    )
    private String brand;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    @Schema(
            description = "Product Price",
            example = "50000"
    )
    private BigDecimal price;

    @NotNull(message = "Category is required")
    @Schema(
            description = "Category Id",
            example = "5",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long categoryId;

}