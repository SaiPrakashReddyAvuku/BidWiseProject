package com.bidwise.backend.controller;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.contract.ContractResponse;
import com.bidwise.backend.dto.dispute.DisputeCreateRequest;
import com.bidwise.backend.dto.dispute.DisputeResponse;
import com.bidwise.backend.dto.message.MessageCreateRequest;
import com.bidwise.backend.dto.message.MessageResponse;
import com.bidwise.backend.dto.notification.NotificationResponse;
import com.bidwise.backend.dto.review.ReviewCreateRequest;
import com.bidwise.backend.dto.review.ReviewResponse;
import com.bidwise.backend.dto.user.UserResponse;
import com.bidwise.backend.dto.user.UserUpdateRequest;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.service.CollaborationService;
import com.bidwise.backend.service.ProjectService;
import com.bidwise.backend.service.TrustService;
import com.bidwise.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommonController {

    private final UserService userService;
    private final CollaborationService collaborationService;
    private final TrustService trustService;
    private final ProjectService projectService;

    @GetMapping("/users")
    public PageResponse<UserResponse> users(@RequestParam(required = false) UserRole role,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "200") int size) {
        return userService.list(role, page, size);
    }

    @GetMapping("/users/{id}")
    public UserResponse getUser(@PathVariable UUID id) {
        return userService.getById(id);
    }

    @PatchMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable UUID id,
                                   @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }

    @PostMapping("/messages")
    public MessageResponse sendMessage(@Valid @RequestBody MessageCreateRequest request) {
        return collaborationService.sendMessage(request);
    }

    @GetMapping("/messages")
    public List<MessageResponse> conversation(@RequestParam UUID userA, @RequestParam UUID userB) {
        return collaborationService.getConversation(userA, userB);
    }

    @GetMapping("/notifications")
    public PageResponse<NotificationResponse> notifications(@RequestParam UUID userId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        return collaborationService.getNotifications(userId, page, size);
    }

    @PatchMapping("/notifications/{id}/read")
    public NotificationResponse read(@PathVariable UUID id) {
        return collaborationService.markNotificationRead(id);
    }

    @PostMapping("/reviews")
    public ReviewResponse createReview(@Valid @RequestBody ReviewCreateRequest request) {
        return trustService.createReview(request);
    }

    @GetMapping("/reviews")
    public PageResponse<ReviewResponse> reviews(@RequestParam UUID toUserId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return trustService.getReviewsForUser(toUserId, page, size);
    }

    @GetMapping("/contracts")
    public PageResponse<ContractResponse> contracts(@RequestParam UUID userId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return projectService.getContractsForUser(userId, page, size);
    }

    @GetMapping("/contracts/{id}")
    public ContractResponse contract(@PathVariable UUID id) {
        return projectService.getContract(id);
    }

    @PostMapping("/disputes")
    public DisputeResponse createDispute(@Valid @RequestBody DisputeCreateRequest request) {
        return trustService.createDispute(request);
    }
}
