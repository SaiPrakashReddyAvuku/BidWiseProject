package com.bidwise.backend.service;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.user.UserCreateRequest;
import com.bidwise.backend.dto.user.UserResponse;
import com.bidwise.backend.entity.enums.UserRole;

import java.util.UUID;

public interface UserService {
    UserResponse create(UserCreateRequest request);
    PageResponse<UserResponse> list(UserRole role, int page, int size);
    UserResponse getById(UUID userId);
    UserResponse block(UUID userId);
    UserResponse verify(UUID userId);
}
