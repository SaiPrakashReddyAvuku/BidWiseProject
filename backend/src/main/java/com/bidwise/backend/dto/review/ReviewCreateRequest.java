package com.bidwise.backend.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReviewCreateRequest(
        @NotNull UUID fromUserId,
        @NotNull UUID toUserId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank String comment
) {
}
