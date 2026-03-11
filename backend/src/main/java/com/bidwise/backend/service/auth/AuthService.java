package com.bidwise.backend.service.auth;

import com.bidwise.backend.dto.auth.AuthLoginRequest;
import com.bidwise.backend.dto.auth.AuthRegisterRequest;
import com.bidwise.backend.dto.auth.AuthResponse;

public interface AuthService {
    AuthResponse register(AuthRegisterRequest request);
    AuthResponse login(AuthLoginRequest request);
}
