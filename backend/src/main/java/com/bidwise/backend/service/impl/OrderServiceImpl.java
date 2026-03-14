package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.order.OrderDeliveryUpdateRequest;
import com.bidwise.backend.dto.order.OrderResponse;
import com.bidwise.backend.dto.order.OrderStatusUpdateRequest;
import com.bidwise.backend.entity.Notification;
import com.bidwise.backend.entity.Order;
import com.bidwise.backend.entity.Payment;
import com.bidwise.backend.entity.Project;
import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.DeliveryType;
import com.bidwise.backend.entity.enums.NotificationType;
import com.bidwise.backend.entity.enums.OrderStatus;
import com.bidwise.backend.entity.enums.PaymentStatus;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.exception.ConflictException;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.exception.UnauthorizedException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.NotificationRepository;
import com.bidwise.backend.repository.OrderRepository;
import com.bidwise.backend.repository.PaymentRepository;
import com.bidwise.backend.repository.ProjectRepository;
import com.bidwise.backend.repository.ContractRepository;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.service.EmailService;
import com.bidwise.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProjectRepository projectRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID orderId, OrderStatusUpdateRequest request, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        UserEntity actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (!order.getSellerId().equals(actor.getId())) {
            throw new UnauthorizedException("Only the seller can update order status");
        }

        OrderStatus next = request.status();
        if (!isValidTransition(order.getStatus(), next)) {
            throw new ConflictException("Invalid order status transition");
        }

        order.setStatus(next);

        if (next == OrderStatus.SHIPPED) {
            notifyBuyer(order, "Order shipped", "Your order has been marked as shipped.");
        }

        if (next == OrderStatus.DELIVERED) {
            notifyBuyer(order, "Order delivered", "Your order has been marked as delivered.");
        }

        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID orderId, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        UserEntity actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (!order.getBuyerId().equals(actor.getId())) {
            throw new UnauthorizedException("Only the buyer can complete the order");
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            return toOrderResponse(order);
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ConflictException("Order must be delivered before it can be completed");
        }

        order.setStatus(OrderStatus.COMPLETED);

        Project project = projectRepository.findById(order.getProjectId())
                .orElseThrow(() -> new NotFoundException("Project not found: " + order.getProjectId()));
        project.setStatus(ProjectStatus.COMPLETED);

        contractRepository.findByProjectId(order.getProjectId())
                .ifPresent(contract -> contract.setProgress(100));

        notificationRepository.save(Notification.builder()
                .userId(order.getSellerId())
                .title("Order completed")
                .message("Buyer confirmed delivery and completed the order.")
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public com.bidwise.backend.dto.common.PageResponse<OrderResponse> getOrdersForUser(String actorEmail, int page, int size) {
        UserEntity actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        var pageable = PageRequest.of(page, size);
        var orders = actor.getRole() == com.bidwise.backend.entity.enums.UserRole.ADMIN
                ? orderRepository.findAll(pageable)
                : orderRepository.findAllByBuyerIdOrSellerId(actor.getId(), actor.getId(), pageable);

        var mapped = orders.map(this::toOrderResponse);
        return PageMapper.map(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        UserEntity actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (actor.getRole() != com.bidwise.backend.entity.enums.UserRole.ADMIN
                && !order.getBuyerId().equals(actor.getId())
                && !order.getSellerId().equals(actor.getId())) {
            throw new UnauthorizedException("You do not have access to this order");
        }

        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateDeliveryDetails(UUID orderId, OrderDeliveryUpdateRequest request, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        UserEntity actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (!order.getBuyerId().equals(actor.getId())) {
            throw new UnauthorizedException("Only the buyer can update delivery details");
        }

        if (request.deliveryType() == DeliveryType.PHYSICAL && (request.deliveryAddress() == null || request.deliveryAddress().isBlank())) {
            throw new ConflictException("Delivery address is required for physical delivery");
        }

        order.setDeliveryType(request.deliveryType());
        order.setDeliveryAddress(request.deliveryType() == DeliveryType.PHYSICAL ? request.deliveryAddress() : null);
        order.setDeliveryInstructions(request.deliveryInstructions());

        notificationRepository.save(Notification.builder()
                .userId(order.getSellerId())
                .title("Delivery details updated")
                .message("Buyer provided delivery details for the order.")
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        return toOrderResponse(order);
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.CREATED && next == OrderStatus.PREPARING) return true;
        if (current == OrderStatus.PREPARING && next == OrderStatus.SHIPPED) return true;
        if (current == OrderStatus.SHIPPED && next == OrderStatus.DELIVERED) return true;
        return false;
    }

    private OrderResponse toOrderResponse(Order order) {
        PaymentStatus paymentStatus = paymentRepository.findByOrderId(order.getId())
                .map(Payment::getStatus)
                .orElse(PaymentStatus.PENDING);
        return DtoMapper.toOrderResponse(order, paymentStatus);
    }

    private void notifyBuyer(Order order, String title, String message) {
        notificationRepository.save(Notification.builder()
                .userId(order.getBuyerId())
                .title(title)
                .message(message)
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        userRepository.findById(order.getBuyerId()).ifPresent(buyer ->
                emailService.sendEmail(buyer.getEmail(), title, message)
        );
    }
}
