package com.shopsphere.payment.processor;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResult {

    private boolean successful;

    private String gatewayTransactionId;

    private String failureReason;

}