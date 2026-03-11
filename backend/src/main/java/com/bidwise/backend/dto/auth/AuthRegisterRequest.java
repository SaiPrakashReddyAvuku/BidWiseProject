package com.bidwise.backend.dto.auth;

import com.bidwise.backend.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AuthRegisterRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 120) String password,
        @NotNull UserRole role,
        @Size(max = 25) String phone,
        @Size(max = 120) String companyName,
        List<String> skills
) {
}
