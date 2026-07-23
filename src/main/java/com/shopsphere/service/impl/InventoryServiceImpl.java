package com.shopsphere.service.impl;

import com.shopsphere.dto.inventory.InventoryRequest;
import com.shopsphere.dto.inventory.InventoryResponse;
import com.shopsphere.entity.Inventory;
import com.shopsphere.entity.Product;
import com.shopsphere.event.LowStockEvent;
import com.shopsphere.exception.BusinessException;
import com.shopsphere.exception.ResourceAlreadyExistsException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.InventoryMapper;
import com.shopsphere.repository.InventoryRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl
        implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public InventoryResponse createInventory(InventoryRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id : "
                                        + request.getProductId()));

        if (inventoryRepository.existsByProductId(product.getId())) {
            throw new ResourceAlreadyExistsException(
                    "Inventory already exists for this product");
        }

        if (request.getMinimumStock() >= request.getMaximumStock()) {
            throw new IllegalArgumentException(
                    "Minimum stock must be less than maximum stock"
            );
        }

        if (request.getQuantity() > request.getMaximumStock()) {
            throw new IllegalArgumentException(
                    "Quantity cannot exceed maximum stock"
            );
        }

        Inventory inventory =
                inventoryMapper.toEntity(request);

        inventory.setProduct(product);

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(savedInventory);
    }


    @Override
    @Transactional
    public InventoryResponse increaseStock(
            Long productId,
            Integer quantity) {

        Inventory inventory = findInventoryByProductId(productId);

        int newQuantity = inventory.getQuantity() + quantity;

        if (newQuantity > inventory.getMaximumStock()) {
            throw new IllegalArgumentException(
                    "Stock exceeds maximum capacity."
            );
        }

        inventory.setQuantity(newQuantity);

        return inventoryMapper.toResponse(inventory);

    }

    @Override
    @Transactional
    public InventoryResponse decreaseStock(
            Long productId,
            Integer quantity) {

        Inventory inventory = findInventoryByProductId(productId);

        if (inventory.getQuantity() < quantity) {
            throw new BusinessException(
                    "Insufficient stock available."
            );
        }

        inventory.setQuantity(
                inventory.getQuantity() - quantity
        );

        if (inventory.getQuantity() <= inventory.getMinimumStock()) {

            eventPublisher.publishEvent(

                    new LowStockEvent(

                            inventory.getProduct().getId(),

                            inventory.getProduct().getName(),

                            inventory.getQuantity(),

                            inventory.getMinimumStock()

                    )

            );

        }

        return inventoryMapper.toResponse(inventory);


    }

    @Override
    @Transactional
    public InventoryResponse reserveStock(
            Long productId,
            Integer quantity) {

        Inventory inventory =
                findInventoryForUpdate(productId);

        if (inventory.getAvailableQuantity() < quantity) {
            throw new BusinessException(
                    "Not enough stock available."
            );
        }

        inventory.setReservedQuantity(

                inventory.getReservedQuantity()
                        + quantity

        );

        return inventoryMapper.toResponse(inventory);

    }

    @Override
    @Transactional
    public InventoryResponse releaseReservedStock(
            Long productId,
            Integer quantity) {

        Inventory inventory =
                findInventoryForUpdate(productId);

        if (inventory.getReservedQuantity() < quantity) {
            throw new BusinessException(
                    "Cannot release more than reserved quantity."
            );
        }

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() - quantity
        );

        return inventoryMapper.toResponse(inventory);

    }

    @Override
    @Transactional
    public InventoryResponse confirmReservation(
            Long productId,
            Integer quantity) {

        Inventory inventory =
                findInventoryForUpdate(productId);


        if (inventory.getReservedQuantity() < quantity) {
            throw new BusinessException(
                    "Cannot confirm more than reserved quantity."
            );
        }

        inventory.setQuantity(
                inventory.getQuantity() - quantity
        );

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() - quantity
        );

        return inventoryMapper.toResponse(inventory);
    }








    

    //helper methods
    private Inventory findInventoryByProductId(Long productId) {

        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        ));
    }

    private Inventory findInventoryForUpdate(Long productId) {

        return inventoryRepository
                .findByProductIdForUpdate(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found."
                        ));
    }





}
