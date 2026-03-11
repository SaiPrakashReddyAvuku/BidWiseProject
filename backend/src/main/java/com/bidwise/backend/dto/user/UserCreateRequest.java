package com.bidwise.backend.dto.user;

import com.bidwise.backend.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UserCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 120) String email,
        @NotNull UserRole role,
        @Size(max = 25) String phone,
        @Size(max = 120) String companyName,
        List<String> skills
) {
}
