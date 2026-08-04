package com.shopsphere.service;

import com.shopsphere.dto.order.OrderResponse;
import com.shopsphere.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder();

    OrderResponse getOrderById(Long orderId);

    List<OrderResponse> getUserOrders();

    void cancelOrder(Long orderId);

    OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus status
    );

    Page<OrderResponse> getAllOrders(Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(
            OrderStatus status,
            Pageable pageable
    );

    Page<OrderResponse> getOrdersByUser(
            Long userId,
            Pageable pageable
    );

}
