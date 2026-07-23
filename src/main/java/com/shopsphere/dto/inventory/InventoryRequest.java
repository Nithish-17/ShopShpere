package com.shopsphere.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class InventoryRequest {

    @NotNull(message = "Product is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero
    private Integer quantity;

    @NotNull(message = "Minimum stock is required")
    @PositiveOrZero
    private Integer minimumStock;

    @NotNull(message = "Maximum stock is required")
    @Positive(message = "Maximum stock must be greater than zero")
    private Integer maximumStock;

}