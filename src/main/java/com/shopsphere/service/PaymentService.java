package com.shopsphere.service;

import com.shopsphere.dto.payment.CreatePaymentRequest;
import com.shopsphere.dto.payment.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request);

    public PaymentResponse retryPayment(Long paymentId);

    PaymentResponse getPaymentByReference(
            String paymentReference
    );

    PaymentResponse getPaymentByOrder(
            Long orderId
    );

    List<PaymentResponse> getMyPayments();

    List<PaymentResponse> getAllPayments();

    List<PaymentResponse> getFailedPayments();

}