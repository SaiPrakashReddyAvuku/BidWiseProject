package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByBidId(UUID bidId);
    Optional<Order> findByProjectId(UUID projectId);
    Page<Order> findAllByBuyerIdOrSellerId(UUID buyerId, UUID sellerId, Pageable pageable);
}
