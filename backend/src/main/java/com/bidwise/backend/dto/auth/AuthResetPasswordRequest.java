package com.bidwise.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AuthResetPasswordRequest(
        UUID userId,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String newPassword
) {
}
