package com.shopsphere.controller;

import com.shopsphere.dto.inventory.InventoryRequest;
import com.shopsphere.dto.inventory.InventoryResponse;
import com.shopsphere.dto.inventory.StockUpdateRequest;
import com.shopsphere.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryResponse createInventory(
            @Valid @RequestBody InventoryRequest request) {

        return inventoryService.createInventory(request);

    }

    @PatchMapping("/products/{productId}/increase")
    public InventoryResponse increaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.increaseStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/decrease")
    public InventoryResponse decreaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.decreaseStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/reserve")
    public InventoryResponse reserveStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.reserveStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/release")
    public InventoryResponse releaseReservedStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.releaseReservedStock(
                productId,
                request.getQuantity()
        );

    }


    @PatchMapping("/products/{productId}/confirm")
    public InventoryResponse confirmReservation(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.confirmReservation(
                productId,
                request.getQuantity()
        );
    }

}
