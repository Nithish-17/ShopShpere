package com.shopsphere.mapper.impl;

import com.shopsphere.dto.payment.PaymentResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.PaymentMethod;
import com.shopsphere.entity.PaymentStatus;
import com.shopsphere.mapper.PaymentMapper;
import com.shopsphere.util.PaymentReferenceGenerator;
import org.springframework.stereotype.Component;


@Component

public class PaymentMapperImpl implements PaymentMapper {
    @Override
    public PaymentResponse toResponse(Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentReference(payment.getPaymentReference())
                .paidAmount(payment.getPaidAmount())
                .paymentStatus(payment.getPaymentStatus())
                .build();


    }

    @Override
    public Payment toEntity(Order order, PaymentMethod paymentMethod) {

        Payment payment = new Payment();

        payment.setOrder(order);

        payment.setPaidAmount(order.getTotalAmount());

        payment.setPaymentMethod(paymentMethod);

        payment.setPaymentStatus(PaymentStatus.PENDING);

        payment.setPaymentReference(
                PaymentReferenceGenerator.generate()
        );

        return  payment;
    }
}
