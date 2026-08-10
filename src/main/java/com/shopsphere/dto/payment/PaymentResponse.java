package com.shopsphere.dto.payment;

import com.shopsphere.entity.PaymentMethod;
import com.shopsphere.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {

    private Long id;

    private String paymentReference;

    private String gatewayTransactionId;

    private BigDecimal paidAmount;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private LocalDateTime completedAt;

}