package com.bidwise.backend.dto.review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID fromUserId,
        UUID toUserId,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
