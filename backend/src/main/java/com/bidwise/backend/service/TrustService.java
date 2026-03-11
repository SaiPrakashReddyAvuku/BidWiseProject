package com.bidwise.backend.service;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.dispute.DisputeCreateRequest;
import com.bidwise.backend.dto.dispute.DisputeResponse;
import com.bidwise.backend.dto.review.ReviewCreateRequest;
import com.bidwise.backend.dto.review.ReviewResponse;
import com.bidwise.backend.entity.enums.DisputeStatus;

import java.util.UUID;

public interface TrustService {
    ReviewResponse createReview(ReviewCreateRequest request);
    PageResponse<ReviewResponse> getReviewsForUser(UUID userId, int page, int size);
    DisputeResponse createDispute(DisputeCreateRequest request);
    PageResponse<DisputeResponse> getDisputes(DisputeStatus status, int page, int size);
    DisputeResponse resolveDispute(UUID disputeId);
}
