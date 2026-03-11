package com.bidwise.backend.dto.bid;

import com.bidwise.backend.entity.enums.BidStatus;

import java.time.Instant;
import java.util.UUID;

public record BidResponse(
        UUID id,
        UUID projectId,
        UUID sellerId,
        Double price,
        Integer deliveryDays,
        String proposal,
        BidStatus status,
        Instant createdAt
) {
}
