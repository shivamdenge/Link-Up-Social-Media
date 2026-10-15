package com.shivamdenge.notificationservice.repository;
import com.shivamdenge.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    java.util.List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
