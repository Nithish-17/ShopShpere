package com.shopsphere.controller;

import com.shopsphere.dto.inventory.InventoryRequest;
import com.shopsphere.dto.inventory.InventoryResponse;
import com.shopsphere.dto.inventory.StockUpdateRequest;
import com.shopsphere.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse createInventory(
            @Valid @RequestBody InventoryRequest request) {

        return inventoryService.createInventory(request);

    }

    @PatchMapping("/products/{productId}/increase")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse increaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.increaseStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/decrease")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse decreaseStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.decreaseStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/reserve")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse reserveStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.reserveStock(
                productId,
                request.getQuantity()
        );

    }

    @PatchMapping("/products/{productId}/release")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse releaseReservedStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.releaseReservedStock(
                productId,
                request.getQuantity()
        );

    }


    @PatchMapping("/products/{productId}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryResponse confirmReservation(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {

        return inventoryService.confirmReservation(
                productId,
                request.getQuantity()
        );
    }

}
