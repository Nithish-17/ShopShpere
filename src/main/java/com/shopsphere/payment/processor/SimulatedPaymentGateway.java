package com.shopsphere.payment.processor;

import com.shopsphere.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class SimulatedPaymentGateway implements PaymentProcessor {

    @Override
    public PaymentResult process(Payment payment) {

        boolean success =
                ThreadLocalRandom.current().nextInt(100) < 80;

        if (success) {

            return new PaymentResult(
                    true,
                    UUID.randomUUID().toString(),
                    null
            );

        }

        return new PaymentResult(
                false,
                null,
                "INSUFFICIENT_FUNDS"
        );

    }

}