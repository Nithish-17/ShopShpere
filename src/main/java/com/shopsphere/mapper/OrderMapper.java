package com.shopsphere.mapper;

import com.shopsphere.dto.order.OrderResponse;
import com.shopsphere.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = OrderItemMapper.class
)
public interface OrderMapper {

    @Mapping(source = "user.id",target = "userId")
    @Mapping(source = "orderItems", target = "items")
    OrderResponse toResponse(
            Order order
    );

}
