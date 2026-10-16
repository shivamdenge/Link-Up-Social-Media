package com.shivamdenge.notificationservice.service;

import com.shivamdenge.notificationservice.entity.Notification;

import com.shivamdenge.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void addNotification(Notification notification){
        log.info("Adding notification to DB: {}", notification.getMessage());
        // Prevent duplicate notifications
        if (notification.getUserId() != null && notification.getMessage() != null) {
            boolean exists = notificationRepository.existsByUserIdAndMessage(
                    notification.getUserId(), notification.getMessage());
            if (exists) {
                log.info("Duplicate notification ignored for user: {}", notification.getUserId());
                return;
            }
        }
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        log.info("Getting notifications for user ID: {}", userId);
        if (userId == null) {
            return List.of();
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        if (userId == null) return 0;
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        log.info("Marking notification {} as read for user {}", notificationId, userId);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (userId == null || userId.equals(n.getUserId())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user {}", userId);
        if (userId != null) {
            notificationRepository.markAllAsReadByUserId(userId);
        }
    }
}

