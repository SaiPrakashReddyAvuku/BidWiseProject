package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Dispute;
import com.bidwise.backend.entity.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Page<Dispute> findAllByStatus(DisputeStatus status, Pageable pageable);
}
