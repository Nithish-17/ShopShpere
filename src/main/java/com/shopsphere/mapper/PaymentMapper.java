package com.shopsphere.mapper;

import com.shopsphere.dto.payment.PaymentResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.PaymentMethod;
import org.springframework.stereotype.Component;


public interface PaymentMapper {

    PaymentResponse toResponse(Payment payment);

    Payment toEntity(Order order, PaymentMethod paymentMethod);
}
