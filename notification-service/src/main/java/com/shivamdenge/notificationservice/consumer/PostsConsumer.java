package com.shivamdenge.notificationservice.consumer;

import com.shivamdenge.notificationservice.entity.Notification;
import com.shivamdenge.notificationservice.event.PostCreated;
import com.shivamdenge.notificationservice.event.PostLiked;
import com.shivamdenge.notificationservice.event.UserCreatedEvent;
import com.shivamdenge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PostsConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "post_created_topic")
    public void handlePostCreated(PostCreated postCreated) {
        log.info("handlePostCreated: {}", postCreated);

        String message = String.format("Your connection with id: %d has created this post: %s",
                postCreated.getOwnerUserId(), postCreated.getContent());
        Notification notification = Notification.builder()
                .message(message)
                .userId(postCreated.getUserId())
                .build();
        notificationService.addNotification(notification);
    }

    @KafkaListener(topics = "post_liked_topic")
    public void handlePostLiked(PostLiked postLiked) {
        log.info("handlePostLiked: {}", postLiked);

        String message = String.format("User with id: %d has liked your post with id: %d",
                postLiked.getLikedByUserId(), postLiked.getPostId());

        Notification notification = Notification.builder()
                .message(message)
                .userId(postLiked.getOwnerUserId())
                .build();
        notificationService.addNotification(notification);
    }

    @KafkaListener(topics = "user_created_topic")
    public void handleUserCreated(UserCreatedEvent userCreatedEvent) {
        log.info("handleUserCreated: {}", userCreatedEvent);

        String message = String.format("User with id: %d and name : %s created",
                userCreatedEvent.getUserId(), userCreatedEvent.getName());

        Notification notification = Notification.builder()
                .message(message)
                .userId(userCreatedEvent.getUserId())
                .build();
        notificationService.addNotification(notification);
    }

    @KafkaListener(topics = "send_connection_request_topic")
    public void handleConnectionRequest(com.shivamdenge.notificationservice.event.ConnectionRequestEvent connectionRequestEvent) {
        log.info("handleConnectionRequest: {}", connectionRequestEvent);

        String senderName = connectionRequestEvent.getSenderName() != null && !connectionRequestEvent.getSenderName().isBlank()
                ? connectionRequestEvent.getSenderName()
                : "Someone";

        String message = String.format("%s wants to connect with you.", senderName);

        Notification notification = Notification.builder()
                .message(message)
                .userId(connectionRequestEvent.getReceiverId())
                .type("CONNECTION_REQUEST")
                .build();
        notificationService.addNotification(notification);
    }
}












