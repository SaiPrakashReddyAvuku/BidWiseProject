package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.dispute.DisputeCreateRequest;
import com.bidwise.backend.dto.dispute.DisputeResponse;
import com.bidwise.backend.dto.review.ReviewCreateRequest;
import com.bidwise.backend.dto.review.ReviewResponse;
import com.bidwise.backend.entity.Dispute;
import com.bidwise.backend.entity.Review;
import com.bidwise.backend.entity.enums.DisputeStatus;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.DisputeRepository;
import com.bidwise.backend.repository.ReviewRepository;
import com.bidwise.backend.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrustServiceImpl implements TrustService {

    private final ReviewRepository reviewRepository;
    private final DisputeRepository disputeRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        Review review = reviewRepository.save(Review.builder()
                .fromUserId(request.fromUserId())
                .toUserId(request.toUserId())
                .rating(request.rating())
                .comment(request.comment())
                .build());
        return DtoMapper.toReviewResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviewsForUser(UUID userId, int page, int size) {
        return PageMapper.map(reviewRepository.findAllByToUserId(userId, PageRequest.of(page, size))
                .map(DtoMapper::toReviewResponse));
    }

    @Override
    @Transactional
    public DisputeResponse createDispute(DisputeCreateRequest request) {
        Dispute dispute = disputeRepository.save(Dispute.builder()
                .projectId(request.projectId())
                .raisedBy(request.raisedBy())
                .against(request.against())
                .reason(request.reason())
                .status(DisputeStatus.OPEN)
                .build());
        return DtoMapper.toDisputeResponse(dispute);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DisputeResponse> getDisputes(DisputeStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var disputes = status == null
                ? disputeRepository.findAll(pageable)
                : disputeRepository.findAllByStatus(status, pageable);

        return PageMapper.map(disputes.map(DtoMapper::toDisputeResponse));
    }

    @Override
    @Transactional
    public DisputeResponse resolveDispute(UUID disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new NotFoundException("Dispute not found: " + disputeId));
        dispute.setStatus(DisputeStatus.RESOLVED);
        return DtoMapper.toDisputeResponse(dispute);
    }
}
