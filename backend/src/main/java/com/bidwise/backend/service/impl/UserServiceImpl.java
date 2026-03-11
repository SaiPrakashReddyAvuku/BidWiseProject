package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.user.UserCreateRequest;
import com.bidwise.backend.dto.user.UserResponse;
import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.exception.ConflictException;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(u -> {
            throw new ConflictException("Email already exists: " + request.email());
        });

        UserEntity user = UserEntity.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode("ChangeMe123!"))
                .role(request.role())
                .phone(request.phone())
                .companyName(request.companyName())
                .skills(request.skills())
                .blocked(false)
                .verified(request.role() != UserRole.SELLER)
                .rating(0.0)
                .build();

        return DtoMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(UserRole role, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var users = role == null
                ? userRepository.findAll(pageable).map(DtoMapper::toUserResponse)
                : userRepository.findAllByRole(role, pageable).map(DtoMapper::toUserResponse);
        return PageMapper.map(users);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(UUID userId) {
        return DtoMapper.toUserResponse(userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId)));
    }

    @Override
    @Transactional
    public UserResponse block(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setBlocked(true);
        return DtoMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse verify(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setVerified(true);
        return DtoMapper.toUserResponse(user);
    }
}
