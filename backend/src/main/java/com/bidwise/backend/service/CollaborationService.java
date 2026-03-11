package com.bidwise.backend.service;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.message.MessageCreateRequest;
import com.bidwise.backend.dto.message.MessageResponse;
import com.bidwise.backend.dto.notification.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface CollaborationService {
    MessageResponse sendMessage(MessageCreateRequest request);
    List<MessageResponse> getConversation(UUID userA, UUID userB);
    PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size);
    NotificationResponse markNotificationRead(UUID notificationId);
}
