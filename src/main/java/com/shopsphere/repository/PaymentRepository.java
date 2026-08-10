package com.shopsphere.repository;

import com.shopsphere.entity.Payment;
import com.shopsphere.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(
            String paymentReference
    );

    Optional<Payment> findByGatewayTransactionId(
            String gatewayTransactionId
    );

    Optional<Payment> findFirstByOrderIdOrderByAttemptNumberDesc(
            Long orderId
    );

    Optional<Payment>
    findFirstByOrderIdAndPaymentStatusOrderByAttemptNumberDesc(
            Long orderId,
            PaymentStatus paymentStatus
    );

    List<Payment> findByOrderIdOrderByAttemptNumberDesc(
            Long orderId
    );

    List<Payment> findByOrderUserId(
            Long userId
    );

    List<Payment> findByPaymentStatus(
            PaymentStatus paymentStatus
    );

}