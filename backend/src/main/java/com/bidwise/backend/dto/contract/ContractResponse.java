package com.bidwise.backend.dto.contract;

import com.bidwise.backend.entity.enums.PaymentStatus;

import java.util.UUID;

public record ContractResponse(
        UUID id,
        UUID bidId,
        UUID projectId,
        UUID buyerId,
        UUID sellerId,
        PaymentStatus paymentStatus,
        Integer progress
) {
}
