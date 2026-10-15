package com.shivamdenge.notificationservice.service;

import com.shivamdenge.notificationservice.entity.Notification;
import com.shivamdenge.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void addNotification(Notification notification){
        log.info("Adding notification to DB {}",notification.getMessage());
        notificationRepository.save(notification);
    }

    public java.util.List<Notification> getNotificationsForUser(Long userId) {
        log.info("Getting notifications for user ID: {}", userId);
        if (userId == null) {
            return java.util.List.of();
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
