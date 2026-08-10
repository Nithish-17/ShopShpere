package com.shopsphere.controller;

import com.shopsphere.dto.payment.CreatePaymentRequest;
import com.shopsphere.dto.payment.PaymentResponse;
import com.shopsphere.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request
    ) {

        log.info("Payment request received for order {}",
                request.getOrderId());

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @PostMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> retryPayment(@PathVariable Long paymentId) {

        PaymentResponse response = paymentService.retryPayment(paymentId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }


    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {

        return ResponseEntity.ok(
                paymentService.getMyPayments()
        );
    }

    @GetMapping("/reference/{paymentReference}")
    public ResponseEntity<PaymentResponse> getPaymentByReference(
            @PathVariable String paymentReference) {

        return ResponseEntity.ok(
                paymentService.getPaymentByReference(paymentReference)
        );
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> getPaymentByOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrder(orderId)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    @GetMapping("/failed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getFailedPayments() {

        return ResponseEntity.ok(
                paymentService.getFailedPayments()
        );
    }


}