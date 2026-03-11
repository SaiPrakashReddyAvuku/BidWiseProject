package com.bidwise.backend.dto.auth;

import com.bidwise.backend.dto.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
