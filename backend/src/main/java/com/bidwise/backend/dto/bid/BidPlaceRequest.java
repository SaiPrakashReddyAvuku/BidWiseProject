package com.bidwise.backend.dto.bid;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.UUID;

public record BidPlaceRequest(
        @NotNull UUID projectId,
        @NotNull UUID sellerId,
        @NotNull @Positive Double price,
        @NotNull @PositiveOrZero Integer deliveryDays,
        @NotBlank String proposal
) {
}
