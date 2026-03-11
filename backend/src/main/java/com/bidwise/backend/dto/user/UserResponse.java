package com.bidwise.backend.dto.user;

import com.bidwise.backend.entity.enums.UserRole;

import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        String phone,
        String companyName,
        boolean blocked,
        boolean verified,
        Double rating,
        List<String> skills
) {
}
