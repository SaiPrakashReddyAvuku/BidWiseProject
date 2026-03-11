package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, UUID> {
    Optional<Contract> findByBidId(UUID bidId);
}
