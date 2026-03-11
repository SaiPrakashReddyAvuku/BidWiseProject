package com.bidwise.backend.dto.project;

import com.bidwise.backend.entity.enums.ProjectStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID buyerId,
        String title,
        String description,
        Double budget,
        String category,
        LocalDate deadline,
        String location,
        List<String> attachments,
        ProjectStatus status,
        long bidsCount,
        Instant createdAt,
        Instant updatedAt
) {
}
