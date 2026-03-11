package com.bidwise.backend.controller;

import com.bidwise.backend.dto.auth.AuthLoginRequest;
import com.bidwise.backend.dto.auth.AuthRegisterRequest;
import com.bidwise.backend.dto.auth.AuthResponse;
import com.bidwise.backend.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody AuthRegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }
}

