package com.shopsphere.payment.processor;

import com.shopsphere.entity.Payment;

public interface PaymentProcessor {


    PaymentResult process(Payment payment);

}