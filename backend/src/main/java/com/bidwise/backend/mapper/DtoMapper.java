package com.bidwise.backend.mapper;

import com.bidwise.backend.dto.bid.BidResponse;
import com.bidwise.backend.dto.contract.ContractResponse;
import com.bidwise.backend.dto.dispute.DisputeResponse;
import com.bidwise.backend.dto.message.MessageResponse;
import com.bidwise.backend.dto.notification.NotificationResponse;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.dto.review.ReviewResponse;
import com.bidwise.backend.dto.user.UserResponse;
import com.bidwise.backend.entity.*;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static UserResponse toUserResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getCompanyName(),
                user.isBlocked(),
                user.isVerified(),
                user.getRating(),
                user.getSkills()
        );
    }

    public static ProjectResponse toProjectResponse(Project project, long bidsCount) {
        return new ProjectResponse(
                project.getId(),
                project.getBuyerId(),
                project.getTitle(),
                project.getDescription(),
                project.getBudget(),
                project.getCategory(),
                project.getDeadline(),
                project.getLocation(),
                project.getAttachments(),
                project.getStatus(),
                bidsCount,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public static BidResponse toBidResponse(Bid bid) {
        return new BidResponse(
                bid.getId(),
                bid.getProjectId(),
                bid.getSellerId(),
                bid.getPrice(),
                bid.getDeliveryDays(),
                bid.getProposal(),
                bid.getStatus(),
                bid.getCreatedAt()
        );
    }

    public static ContractResponse toContractResponse(Contract contract) {
        return new ContractResponse(
                contract.getId(),
                contract.getBidId(),
                contract.getProjectId(),
                contract.getBuyerId(),
                contract.getSellerId(),
                contract.getPaymentStatus(),
                contract.getProgress()
        );
    }

    public static MessageResponse toMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getFromUserId(),
                message.getToUserId(),
                message.getContent(),
                message.getAttachment(),
                message.getCreatedAt()
        );
    }

    public static NotificationResponse toNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public static ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getFromUserId(),
                review.getToUserId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    public static DisputeResponse toDisputeResponse(Dispute dispute) {
        return new DisputeResponse(
                dispute.getId(),
                dispute.getProjectId(),
                dispute.getRaisedBy(),
                dispute.getAgainst(),
                dispute.getReason(),
                dispute.getStatus(),
                dispute.getCreatedAt()
        );
    }
}
