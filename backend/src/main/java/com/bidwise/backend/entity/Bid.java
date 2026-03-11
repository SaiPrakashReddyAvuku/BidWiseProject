package com.bidwise.backend.entity;

import com.bidwise.backend.entity.enums.BidStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bids", indexes = {
        @Index(name = "idx_bid_project", columnList = "projectId"),
        @Index(name = "idx_bid_seller", columnList = "sellerId")
})
public class Bid extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private UUID sellerId;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer deliveryDays;

    @Column(nullable = false, length = 2000)
    private String proposal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BidStatus status;
}
