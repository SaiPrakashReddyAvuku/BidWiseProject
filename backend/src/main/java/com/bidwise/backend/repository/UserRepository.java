package com.bidwise.backend.repository;

import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    Page<UserEntity> findAllByRole(UserRole role, Pageable pageable);
}
