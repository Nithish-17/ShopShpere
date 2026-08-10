package com.shopsphere.event;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderConfirmedEvent {

    private final long orderId;

    private final long paymentId;

}