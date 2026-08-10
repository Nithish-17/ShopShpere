package com.shopsphere.dto.payment;

import com.shopsphere.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private PaymentMethod paymentMethod;

}