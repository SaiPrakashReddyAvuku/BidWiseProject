package com.bidwise.backend.dto.order;

import com.bidwise.backend.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull OrderStatus status
) {
}
