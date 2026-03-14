package com.bidwise.backend.dto.payment;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaymentIntentRequest(
        @NotNull UUID orderId
) {
}
