package com.shopsphere.controller;

import com.shopsphere.dto.order.OrderResponse;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder() {

        OrderResponse response = orderService.createOrder();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {

        return ResponseEntity.ok(
                orderService.getUserOrders()
        );
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId) {

        orderService.cancelOrder(orderId);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(

            @PathVariable Long orderId,

            @RequestParam OrderStatus status){

        return ResponseEntity.ok(

                orderService.updateOrderStatus(
                        orderId,
                        status
                )

        );

    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            Pageable pageable) {

        return ResponseEntity.ok(
                orderService.getAllOrders(pageable)
        );

    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(

            @PathVariable OrderStatus status,

            Pageable pageable) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(
                        status,
                        pageable
                )
        );

    }

    @GetMapping("/user/{userId}/page")
    public ResponseEntity<Page<OrderResponse>> getOrdersByUser(

            @PathVariable Long userId,

            Pageable pageable) {

        return ResponseEntity.ok(
                orderService.getOrdersByUser(
                        userId,
                        pageable
                )
        );

    }

}
