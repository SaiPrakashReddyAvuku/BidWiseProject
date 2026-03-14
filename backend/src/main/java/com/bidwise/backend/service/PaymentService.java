package com.bidwise.backend.service;

import com.bidwise.backend.dto.payment.PaymentIntentRequest;
import com.bidwise.backend.dto.payment.PaymentIntentResponse;

public interface PaymentService {
    PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request, String buyerEmail);
    void handleWebhook(String payload, String signatureHeader);
}
