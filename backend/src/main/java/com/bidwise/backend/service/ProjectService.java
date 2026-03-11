package com.bidwise.backend.service;

import com.bidwise.backend.dto.bid.BidPlaceRequest;
import com.bidwise.backend.dto.bid.BidResponse;
import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.contract.ContractResponse;
import com.bidwise.backend.dto.project.ProjectCreateRequest;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.entity.enums.ProjectStatus;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectResponse createProject(String buyerEmail, ProjectCreateRequest request);
    PageResponse<ProjectResponse> listProjects(ProjectStatus status, UUID buyerId, int page, int size);
    ProjectResponse getProject(UUID projectId);
    BidResponse placeBid(BidPlaceRequest request);
    List<BidResponse> getProjectBids(UUID projectId);
    ContractResponse acceptBid(UUID projectId, UUID bidId);
    BidResponse rejectBid(UUID projectId, UUID bidId);
    PageResponse<BidResponse> getSellerBids(UUID sellerId, int page, int size);
}
