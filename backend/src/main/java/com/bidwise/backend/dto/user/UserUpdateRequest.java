package com.bidwise.backend.dto.user;

import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(max = 100) String name,
        @Size(max = 25) String phone,
        @Size(max = 120) String companyName
) {
}
