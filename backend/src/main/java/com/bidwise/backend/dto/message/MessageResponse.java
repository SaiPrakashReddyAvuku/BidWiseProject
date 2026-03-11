package com.bidwise.backend.dto.message;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID fromUserId,
        UUID toUserId,
        String content,
        String attachment,
        Instant createdAt
) {
}
