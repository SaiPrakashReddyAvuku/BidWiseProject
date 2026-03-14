package com.bidwise.backend.entity;

import com.bidwise.backend.entity.enums.OrderStatus;
import com.bidwise.backend.entity.enums.DeliveryType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_project", columnList = "projectId"),
        @Index(name = "idx_order_buyer", columnList = "buyerId"),
        @Index(name = "idx_order_seller", columnList = "sellerId")
})
public class Order extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false, unique = true)
    private UUID bidId;

    @Column(nullable = false)
    private UUID buyerId;

    @Column(nullable = false)
    private UUID sellerId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DeliveryType deliveryType;

    @Column(length = 500)
    private String deliveryAddress;

    @Column(length = 1000)
    private String deliveryInstructions;
}
