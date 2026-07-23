package com.shopsphere.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LowStockEvent {

    private final Long productId;

    private final String productName;

    private final Integer currentStock;

    private final Integer minimumStock;

}
