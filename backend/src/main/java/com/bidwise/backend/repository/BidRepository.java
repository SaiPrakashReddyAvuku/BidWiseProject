package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Bid;
import com.bidwise.backend.entity.enums.BidStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BidRepository extends JpaRepository<Bid, UUID> {
    List<Bid> findAllByProjectId(UUID projectId);
    Page<Bid> findAllBySellerId(UUID sellerId, Pageable pageable);
    long countByProjectId(UUID projectId);
    long countBySellerIdAndStatus(UUID sellerId, BidStatus status);
    boolean existsByProjectIdAndStatus(UUID projectId, BidStatus status);
}
