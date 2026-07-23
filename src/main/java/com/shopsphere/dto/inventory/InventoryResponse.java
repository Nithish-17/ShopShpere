package com.shopsphere.dto.inventory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryResponse {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private Integer reservedQuantity;

    private Integer availableQuantity;

    private Integer minimumStock;

    private Integer maximumStock;

}