package com.bidwise.backend.controller;

import com.bidwise.backend.dto.payment.PaymentIntentRequest;
import com.bidwise.backend.dto.payment.PaymentIntentResponse;
import com.bidwise.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public PaymentIntentResponse createIntent(@Valid @RequestBody PaymentIntentRequest request,
                                              Authentication authentication) {
        return paymentService.createPaymentIntent(request, authentication.getName());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                          @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok("ok");
    }
}
