package com.shopsphere.listener;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.event.OrderConfirmedEvent;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.service.notification.EmailService;
import com.shopsphere.service.notification.InvoicePdfGenerator;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmedListener {

    private final EmailService emailService;

    private final InvoicePdfGenerator pdfGenerator;

    private final OrderRepository orderRepository;

    private final PaymentRepository paymentRepository;

    @Async("emailTaskExecutor")
    @EventListener
    @Transactional
    public void handleOrderConfirmed(
            OrderConfirmedEvent event
    ) throws MessagingException {

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found."));

        Payment payment = paymentRepository.findById(event.getPaymentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found."));


        byte[] pdf =
                pdfGenerator.generateInvoice(order);

        Map<String,Object> variables =
                new HashMap<>();

        variables.put(
                "customerName",
                order.getUser().getFirstName()
        );

        variables.put(
                "customerName",
                order.getUser().getFirstName()
        );

        variables.put(
                "orderNumber",
                order.getId()
        );

        variables.put(
                "orderDate",
                order.getOrderDate()
        );

        variables.put(
                "totalAmount",
                order.getTotalAmount()
        );

        variables.put(
                "items",
                order.getOrderItems()
        );

        variables.put(

                "paymentMethod",

                payment
                        .getPaymentMethod()

        );


        emailService.sendEmail(

                order.getUser().getEmail(),

                "Order Confirmation",

                "order-confirmation",

                variables,

                pdf,

                "invoice.pdf"

        );


    }

}
