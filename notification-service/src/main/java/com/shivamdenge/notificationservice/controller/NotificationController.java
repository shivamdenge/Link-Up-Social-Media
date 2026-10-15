package com.shivamdenge.notificationservice.controller;

import com.shivamdenge.notificationservice.entity.Notification;
import com.shivamdenge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/core", ""})
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        log.info("Fetching notifications for userId header: {}", userId);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }
}
