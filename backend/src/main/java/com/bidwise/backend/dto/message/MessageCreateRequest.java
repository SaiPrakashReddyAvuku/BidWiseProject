package com.bidwise.backend.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MessageCreateRequest(
        @NotNull UUID fromUserId,
        @NotNull UUID toUserId,
        @NotBlank String content,
        String attachment
) {
}
