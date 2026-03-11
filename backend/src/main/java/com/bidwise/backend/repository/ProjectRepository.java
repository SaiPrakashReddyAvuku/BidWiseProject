package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Project;
import com.bidwise.backend.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findAllByBuyerId(UUID buyerId, Pageable pageable);
    Page<Project> findAllByStatus(ProjectStatus status, Pageable pageable);
}
