package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @Column(
            name = "payment_reference",
            nullable = false,
            unique = true
    )
    private String paymentReference;

    @Column(
            name = "gateway_transaction_id"
    )
    private String gatewayTransactionId;

    @Column(
            name = "paid_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal paidAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_date")
    LocalDateTime completedAt; //payment date

    @Column(nullable = false)
    private Integer attemptNumber;

    @Column(
            name = "failure_reason",
            length = 500
    )
    private String failureReason;

    @Column(name = "gateway_name")
    private String gatewayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "order_id",
            nullable = false
    )
    private Order order;

}