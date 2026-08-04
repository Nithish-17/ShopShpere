package com.shopsphere.mapper;

import com.shopsphere.dto.order.OrderItemResponse;
import com.shopsphere.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    @Mapping(source = "product.id",
            target = "productId")
    OrderItemResponse toResponse(
            OrderItem orderItem
    );

}