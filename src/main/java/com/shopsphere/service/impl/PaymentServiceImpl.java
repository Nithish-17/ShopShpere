package com.shopsphere.service.impl;


import com.shopsphere.dto.payment.CreatePaymentRequest;
import com.shopsphere.dto.payment.PaymentResponse;
import com.shopsphere.entity.*;
import com.shopsphere.event.OrderConfirmedEvent;
import com.shopsphere.exception.BusinessException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.PaymentMapper;
import com.shopsphere.payment.processor.PaymentProcessor;
import com.shopsphere.payment.processor.PaymentResult;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.service.PaymentService;
import com.shopsphere.service.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final CurrentUserService currentUserService;
    private final PaymentProcessor paymentGateway;
    private final ApplicationEventPublisher eventPublisher;



    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    public PaymentResponse createPayment(CreatePaymentRequest request) {

        User currentUser = currentUserService.getCurrentUser();

        Order order = getOrder(request.getOrderId());

        validateOrderOwnership(order, currentUser);

        validateOrderAlreadyPaid(order);

        int attemptNumber = getNextAttemptNumber(order);

        return processPayment(
                order,
                request.getPaymentMethod(),
                attemptNumber
        );
    }




    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    public PaymentResponse retryPayment(Long paymentId) {

        User currentUser = currentUserService.getCurrentUser();

        Payment payment = getPayment(paymentId);

        validateOrderOwnership(payment.getOrder(), currentUser);

        validateRetry(payment);

        validateOrderAlreadyPaid(payment.getOrder());

        int attemptNumber = getNextAttemptNumber(payment.getOrder());

        return processPayment(
                payment.getOrder(),
                payment.getPaymentMethod(),
                attemptNumber
        );
    }



    private PaymentResponse processPayment(
            Order order,
            PaymentMethod paymentMethod,
            int attemptNumber) {

        Payment payment =
                paymentMapper.toEntity(order, paymentMethod);

        payment.setAttemptNumber(attemptNumber);

        Payment savedPayment =
                paymentRepository.save(payment);

        PaymentResult result =
                paymentGateway.process(savedPayment);

        savedPayment.setGatewayTransactionId(
                result.getGatewayTransactionId());

        if (result.isSuccessful()) {

            handleSuccess(savedPayment);

        } else {

            handleFailure(
                    savedPayment,
                    result.getFailureReason()
            );

        }

        return paymentMapper.toResponse(savedPayment);

    }


    // SUCCESS


    private void handleSuccess(Payment payment) {

        payment.setPaymentStatus(PaymentStatus.COMPLETED);

        payment.setCompletedAt(LocalDateTime.now());

        payment.getOrder()
                .setStatus(OrderStatus.CONFIRMED);

        eventPublisher.publishEvent(

                new OrderConfirmedEvent(
                        payment.getOrder().getId(),
                        payment.getId()
                )

        );

    }


    // FAILURE


    private void handleFailure(
            Payment payment,
            String reason) {

        payment.setPaymentStatus(PaymentStatus.FAILED);

        payment.setFailureReason(reason);

    }

    // ===========================
    // VALIDATIONS
    // ===========================

    private void validateOrderOwnership(
            Order order,
            User user) {

        if (!order.getUser().getId().equals(user.getId())) {

            throw new AccessDeniedException(
                    "Access denied."
            );

        }

    }

    private void validateOrderAlreadyPaid(Order order) {

        boolean paid =
                paymentRepository
                        .findFirstByOrderIdAndPaymentStatusOrderByAttemptNumberDesc(
                                order.getId(),
                                PaymentStatus.COMPLETED
                        )
                        .isPresent();

        if (paid) {

            throw new BusinessException(
                    "Order already paid."
            );

        }

    }

    private void validateRetry(Payment payment) {

        if (payment.getPaymentStatus()
                != PaymentStatus.FAILED) {

            throw new BusinessException(
                    "Only failed payments can be retried."
            );

        }

    }


    // HELPERS

    private Order getOrder(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found."
                        ));

    }

    private Payment getPayment(Long paymentId) {

        return paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found."
                        ));

    }

    private int getNextAttemptNumber(Order order) {

        return paymentRepository
                .findFirstByOrderIdOrderByAttemptNumberDesc(
                        order.getId()
                )
                .map(payment ->
                        payment.getAttemptNumber() + 1)
                .orElse(1);

    }



    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByReference(String reference) {

        return paymentMapper.toResponse(
                paymentRepository
                        .findByPaymentReference(reference)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found."
                                ))
        );

    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrder(Long orderId) {

        return paymentMapper.toResponse(
                paymentRepository
                        .findFirstByOrderIdOrderByAttemptNumberDesc(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found."
                                ))
        );

    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {

        User currentUser = currentUserService.getCurrentUser();

        return paymentRepository
                .findByOrderUserId(currentUser.getId())
                .stream()
                .map(paymentMapper::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getFailedPayments() {

        return paymentRepository
                .findByPaymentStatus(PaymentStatus.FAILED)
                .stream()
                .map(paymentMapper::toResponse)
                .toList();

    }

}