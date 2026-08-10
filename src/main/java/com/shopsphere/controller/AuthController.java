package com.shopsphere.controller;

import com.shopsphere.dto.login.LoginRequest;
import com.shopsphere.dto.login.LoginResponse;
import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.event.OrderConfirmedEvent;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.service.AuthService;
import com.shopsphere.service.UserService;
import com.sun.net.httpserver.Authenticator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    private final AuthService authService;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher eventPublisher;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(

            @Valid
            @RequestBody LoginRequest request){

        return ResponseEntity.ok(

                authService.login(request)

        );

    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegistrationRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(request));
    }

    @PostMapping("/email")
    public ResponseEntity<Void> triggerEmail(
            @RequestParam Long orderId,
            @RequestParam Long paymentId
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found."));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found."));

        eventPublisher.publishEvent(
                new OrderConfirmedEvent(
                        order.getId(),
                        payment.getId()
                )
        );

        return ResponseEntity.ok().build();
    }
}
