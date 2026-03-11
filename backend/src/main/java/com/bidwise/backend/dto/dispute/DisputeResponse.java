package com.bidwise.backend.dto.dispute;

import com.bidwise.backend.entity.enums.DisputeStatus;

import java.time.Instant;
import java.util.UUID;

public record DisputeResponse(
        UUID id,
        UUID projectId,
        UUID raisedBy,
        UUID against,
        String reason,
        DisputeStatus status,
        Instant createdAt
) {
}
