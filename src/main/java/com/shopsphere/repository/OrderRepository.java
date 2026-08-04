package com.shopsphere.repository;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(
            Long userId
    );

    List<Order> findByStatus(
            OrderStatus status
    );

    List<Order> findByUserIdAndStatus(
            Long userId,
            OrderStatus status
    );

    Page<Order> findAll(Pageable pageable);

    Page<Order> findByStatus(
            OrderStatus status,
            Pageable pageable
    );

    Page<Order> findByUserId(
            Long userId,
            Pageable pageable
    );

}
