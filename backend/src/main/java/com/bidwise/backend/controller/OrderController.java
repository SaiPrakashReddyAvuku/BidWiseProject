package com.bidwise.backend.controller;

import com.bidwise.backend.dto.order.OrderDeliveryUpdateRequest;
import com.bidwise.backend.dto.order.OrderResponse;
import com.bidwise.backend.dto.order.OrderStatusUpdateRequest;
import com.bidwise.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.bidwise.backend.dto.common.PageResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public PageResponse<OrderResponse> list(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            Authentication authentication) {
        return orderService.getOrdersForUser(authentication.getName(), page, size);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(@PathVariable UUID orderId, Authentication authentication) {
        return orderService.getOrder(orderId, authentication.getName());
    }

    @PatchMapping("/{orderId}/delivery")
    public OrderResponse updateDelivery(@PathVariable UUID orderId,
                                        @Valid @RequestBody OrderDeliveryUpdateRequest request,
                                        Authentication authentication) {
        return orderService.updateDeliveryDetails(orderId, request, authentication.getName());
    }

    @PutMapping("/{orderId}/status")
    public OrderResponse updateStatus(@PathVariable UUID orderId,
                                      @Valid @RequestBody OrderStatusUpdateRequest request,
                                      Authentication authentication) {
        return orderService.updateStatus(orderId, request, authentication.getName());
    }

    @PostMapping("/{orderId}/complete")
    public OrderResponse complete(@PathVariable UUID orderId, Authentication authentication) {
        return orderService.completeOrder(orderId, authentication.getName());
    }
}
