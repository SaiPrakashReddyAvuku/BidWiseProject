package com.bidwise.backend.dto.order;

import com.bidwise.backend.entity.enums.DeliveryType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderDeliveryUpdateRequest(
        @NotNull DeliveryType deliveryType,
        @Size(max = 500) String deliveryAddress,
        @Size(max = 1000) String deliveryInstructions
) {
}
