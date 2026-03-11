package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.message.MessageCreateRequest;
import com.bidwise.backend.dto.message.MessageResponse;
import com.bidwise.backend.dto.notification.NotificationResponse;
import com.bidwise.backend.entity.Message;
import com.bidwise.backend.entity.Notification;
import com.bidwise.backend.entity.enums.NotificationType;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.MessageRepository;
import com.bidwise.backend.repository.NotificationRepository;
import com.bidwise.backend.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollaborationServiceImpl implements CollaborationService {

    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageCreateRequest request) {
        Message saved = messageRepository.save(Message.builder()
                .fromUserId(request.fromUserId())
                .toUserId(request.toUserId())
                .content(request.content())
                .attachment(request.attachment())
                .build());

        notificationRepository.save(Notification.builder()
                .userId(request.toUserId())
                .title("New message")
                .message("You have a new message")
                .type(NotificationType.MESSAGE)
                .isRead(false)
                .build());

        return DtoMapper.toMessageResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getConversation(UUID userA, UUID userB) {
        return messageRepository.findConversation(userA, userB)
                .stream()
                .map(DtoMapper::toMessageResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        var notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(DtoMapper::toNotificationResponse);
        return PageMapper.map(notifications);
    }

    @Override
    @Transactional
    public NotificationResponse markNotificationRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        notification.setRead(true);
        return DtoMapper.toNotificationResponse(notification);
    }
}
