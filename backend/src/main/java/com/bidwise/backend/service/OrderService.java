package com.bidwise.backend.service;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.order.OrderDeliveryUpdateRequest;
import com.bidwise.backend.dto.order.OrderResponse;
import com.bidwise.backend.dto.order.OrderStatusUpdateRequest;

import java.util.UUID;

public interface OrderService {
    OrderResponse updateStatus(UUID orderId, OrderStatusUpdateRequest request, String actorEmail);
    OrderResponse completeOrder(UUID orderId, String actorEmail);
    PageResponse<OrderResponse> getOrdersForUser(String actorEmail, int page, int size);
    OrderResponse getOrder(UUID orderId, String actorEmail);
    OrderResponse updateDeliveryDetails(UUID orderId, OrderDeliveryUpdateRequest request, String actorEmail);
}
