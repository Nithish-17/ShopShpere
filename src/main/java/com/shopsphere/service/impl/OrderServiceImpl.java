package com.shopsphere.service.impl;

import com.shopsphere.dto.order.OrderResponse;
import com.shopsphere.entity.*;
import com.shopsphere.exception.BusinessException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.OrderMapper;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ShoppingCartRepository;
import com.shopsphere.service.InventoryService;
import com.shopsphere.service.OrderService;
import com.shopsphere.service.ShoppingCartService;
import com.shopsphere.service.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    private final OrderMapper orderMapper;

    private final UserRepository userRepository;

    private final ShoppingCartRepository shoppingCartRepository;

    private final InventoryService inventoryService;

    private final ShoppingCartService shoppingCartService;

    private final CurrentUserService  currentUserService;

    @Override
    public OrderResponse createOrder() {

        User user = currentUserService.getCurrentUser();

        long userId = user.getId();

            ShoppingCart cart = shoppingCartRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Shopping cart not found."));

            if (cart.getCartItems().isEmpty()) {
                throw new BusinessException("Shopping cart is empty.");
            }

            Order order = new Order();
            order.setUser(user);
            order.setStatus(OrderStatus.PENDING);
            order.setOrderDate(LocalDateTime.now());

            BigDecimal totalAmount = BigDecimal.ZERO;

            for (CartItem cartItem : cart.getCartItems()) {

                OrderItem orderItem = new OrderItem();

                orderItem.setProduct(cartItem.getProduct());
                orderItem.setProductName(cartItem.getProduct().getName());
                orderItem.setProductPrice(cartItem.getPrice());
                orderItem.setQuantity(cartItem.getQuantity());

                BigDecimal subtotal =
                        cartItem.getPrice().multiply(
                                BigDecimal.valueOf(cartItem.getQuantity()));

                orderItem.setSubtotal(subtotal);

                totalAmount = totalAmount.add(subtotal);

                inventoryService.confirmReservation(
                        cartItem.getProduct().getId(),
                        cartItem.getQuantity()
                );

                order.addOrderItem(orderItem);
            }

            order.setTotalAmount(totalAmount);

            Order savedOrder = orderRepository.save(order);

            shoppingCartService.emptyCart();

            return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(
            Long orderId) {

        Order order = findOrder(orderId);

        return orderMapper.toResponse(order);

    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders() {

        long userId = currentUserService.getCurrentUser().getId();

        return orderRepository
                .findByUserIdOrderByOrderDateDesc(
                        userId
                )
                .stream()
                .map(orderMapper::toResponse)
                .toList();

    }

    @Override
    public void cancelOrder(Long orderId) {

        Order order = findOrder(orderId);

        validateCancellation(order);

        for (OrderItem item : order.getOrderItems()) {

            inventoryService.increaseStock(
                    item.getProduct().getId(),
                    item.getQuantity()
            );

        }

        order.setStatus(OrderStatus.CANCELLED);

    }


    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus status) {

        Order order = findOrder(orderId);

        validateStatusTransition(
                order.getStatus(),
                status
        );

        order.setStatus(status);

        return orderMapper.toResponse(order);

    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getAllOrders(
            Pageable pageable) {

        return orderRepository
                .findAll(pageable)
                .map(orderMapper::toResponse);

    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getOrdersByStatus(
            OrderStatus status,
            Pageable pageable) {

        return orderRepository
                .findByStatus(status, pageable)
                .map(orderMapper::toResponse);

    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getOrdersByUser(
            Long userId,
            Pageable pageable) {

        return orderRepository
                .findByUserId(userId, pageable)
                .map(orderMapper::toResponse);

    }







    //helper method

    private Order findOrder(Long orderId){

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found."
                        ));

    }

    private void validateCancellation(Order order) {

        switch (order.getStatus()) {

            case SHIPPED ->
                    throw new BusinessException(
                            "Shipped orders cannot be cancelled."
                    );

            case DELIVERED ->
                    throw new BusinessException(
                            "Delivered orders cannot be cancelled."
                    );

            case CANCELLED ->
                    throw new BusinessException(
                            "Order is already cancelled."
                    );

            default -> {
                // Cancellation allowed
            }
        }
    }

    private void validateStatusTransition(
            OrderStatus current,
            OrderStatus next) {

        switch (current) {

            case PENDING -> {

                if (next != OrderStatus.CONFIRMED &&
                        next != OrderStatus.CANCELLED) {

                    throw new BusinessException(
                            "Invalid status transition."
                    );
                }

            }

            case CONFIRMED -> {

                if (next != OrderStatus.PACKED &&
                        next != OrderStatus.CANCELLED) {

                    throw new BusinessException(
                            "Invalid status transition."
                    );
                }

            }

            case PACKED -> {

                if (next != OrderStatus.SHIPPED &&
                        next != OrderStatus.CANCELLED) {

                    throw new BusinessException(
                            "Invalid status transition."
                    );
                }

            }

            case SHIPPED -> {

                if (next != OrderStatus.DELIVERED) {

                    throw new BusinessException(
                            "Invalid status transition."
                    );
                }

            }

            case DELIVERED,
                 CANCELLED ->

                    throw new BusinessException(
                            "Order cannot change state."
                    );

        }

    }
}
