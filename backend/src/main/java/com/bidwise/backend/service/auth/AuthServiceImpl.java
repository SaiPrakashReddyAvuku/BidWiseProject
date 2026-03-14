package com.bidwise.backend.service.auth;

import com.bidwise.backend.dto.auth.AuthLoginRequest;
import com.bidwise.backend.dto.auth.AuthRegisterRequest;
import com.bidwise.backend.dto.auth.AuthResponse;
import com.bidwise.backend.dto.auth.AuthResetPasswordRequest;
import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.exception.ConflictException;
import com.bidwise.backend.exception.UnauthorizedException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(AuthRegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(u -> {
            throw new ConflictException("Email already exists: " + request.email());
        });

        UserEntity user = userRepository.save(UserEntity.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .phone(request.phone())
                .companyName(request.companyName())
                .skills(request.skills() == null ? List.of() : request.skills())
                .blocked(false)
                .verified(request.role() != UserRole.SELLER)
                .rating(0.0)
                .build());

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, DtoMapper.toUserResponse(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthLoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserEntity user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (user.isBlocked()) {
            throw new UnauthorizedException("User is blocked");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, DtoMapper.toUserResponse(user));
    }

    @Override
    @Transactional
    public void resetPassword(AuthResetPasswordRequest request) {
        UserEntity user = userRepository.findById(request.userId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }
}
