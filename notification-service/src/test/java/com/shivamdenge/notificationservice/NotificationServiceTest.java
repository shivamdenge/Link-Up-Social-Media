package com.shivamdenge.notificationservice;

import com.shivamdenge.notificationservice.entity.Notification;
import com.shivamdenge.notificationservice.repository.NotificationRepository;
import com.shivamdenge.notificationservice.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void testAddNotification() {
        Notification notification = Notification.builder()
                .userId(1L)
                .message("Alice wants to connect with you.")
                .build();

        notificationService.addNotification(notification);
        verify(notificationRepository).save(notification);
    }

    @Test
    void testGetNotificationsForUser() {
        Notification notification = Notification.builder()
                .id(1L)
                .userId(2L)
                .message("Bob wants to connect with you.")
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(2L))
                .thenReturn(List.of(notification));

        List<Notification> result = notificationService.getNotificationsForUser(2L);
        assertEquals(1, result.size());
        assertEquals("Bob wants to connect with you.", result.get(0).getMessage());
    }

    @Test
    void testGetNotificationsForNullUser() {
        List<Notification> result = notificationService.getNotificationsForUser(null);
        assertTrue(result.isEmpty());
        verifyNoInteractions(notificationRepository);
    }

    @Test
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(2L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(2L);
        assertEquals(5L, count);

        assertEquals(0L, notificationService.getUnreadCount(null));
    }

    @Test
    void testMarkAsRead_MatchingUser() {
        Notification notification = Notification.builder()
                .id(10L)
                .userId(2L)
                .isRead(false)
                .build();

        when(notificationRepository.findById(10L)).thenReturn(java.util.Optional.of(notification));

        notificationService.markAsRead(10L, 2L);

        assertTrue(notification.getIsRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void testMarkAllAsRead() {
        notificationService.markAllAsRead(2L);
        verify(notificationRepository).markAllAsReadByUserId(2L);
    }
}
