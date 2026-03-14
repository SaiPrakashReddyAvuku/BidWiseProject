package com.bidwise.backend.dto.order;

import com.bidwise.backend.entity.enums.OrderStatus;
import com.bidwise.backend.entity.enums.PaymentStatus;
import com.bidwise.backend.entity.enums.DeliveryType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID projectId,
        UUID bidId,
        UUID buyerId,
        UUID sellerId,
        BigDecimal price,
        OrderStatus status,
        PaymentStatus paymentStatus,
        DeliveryType deliveryType,
        String deliveryAddress,
        String deliveryInstructions,
        Instant createdAt
) {
}
