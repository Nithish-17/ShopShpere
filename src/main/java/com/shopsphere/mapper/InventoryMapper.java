package com.shopsphere.mapper;

import com.shopsphere.dto.inventory.InventoryRequest;
import com.shopsphere.dto.inventory.InventoryResponse;
import com.shopsphere.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    Inventory toEntity(InventoryRequest request);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "availableQuantity",
            expression = "java(inventory.getAvailableQuantity())")
    InventoryResponse toResponse(Inventory inventory);

}
