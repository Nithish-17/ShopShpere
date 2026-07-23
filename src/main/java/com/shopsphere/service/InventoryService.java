package com.shopsphere.service;

import com.shopsphere.dto.inventory.InventoryRequest;
import com.shopsphere.dto.inventory.InventoryResponse;

public interface InventoryService {

    InventoryResponse createInventory(
            InventoryRequest request);

    InventoryResponse increaseStock(
            Long productId,
            Integer quantity);

    InventoryResponse decreaseStock(
            Long productId,
            Integer quantity);

    InventoryResponse reserveStock(
            Long productId,
            Integer quantity);

    InventoryResponse releaseReservedStock(
            Long productId,
            Integer quantity);

    InventoryResponse confirmReservation(
            Long productId,
            Integer quantity);
}
