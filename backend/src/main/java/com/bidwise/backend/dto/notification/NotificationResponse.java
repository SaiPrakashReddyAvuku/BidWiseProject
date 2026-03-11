package com.bidwise.backend.dto.notification;

import com.bidwise.backend.entity.enums.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        NotificationType type,
        boolean isRead,
        Instant createdAt
) {
}
