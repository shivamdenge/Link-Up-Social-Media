package com.shivamdenge.connectionsservice;

import com.shivamdenge.connectionsservice.auth.AuthContextHolder;
import com.shivamdenge.connectionsservice.entity.Person;
import com.shivamdenge.connectionsservice.event.ConnectionRequestEvent;
import com.shivamdenge.connectionsservice.exception.BadRequestException;
import com.shivamdenge.connectionsservice.repository.PersonRepository;
import com.shivamdenge.connectionsservice.service.ConnectionsService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConnectionsServiceTest {

    @Mock
    private PersonRepository personRepository;

    @Mock
    private KafkaTemplate<Long, ConnectionRequestEvent> kafkaTemplate;

    @InjectMocks
    private ConnectionsService connectionsService;

    @BeforeEach
    void setUp() {
        AuthContextHolder.setCurrentUserId(1L);
    }

    @AfterEach
    void tearDown() {
        AuthContextHolder.clear();
    }

    @Test
    void testSendConnectionRequest_Success() {
        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 2L)).thenReturn(false);
        when(personRepository.connectionRequestExists(2L, 1L)).thenReturn(false);
        when(personRepository.findByUserId(1L)).thenReturn(Optional.of(Person.builder().userId(1L).name("User One").build()));

        assertDoesNotThrow(() -> connectionsService.sendConnectionRequest(2L));

        verify(personRepository).addConnectionRequest(1L, 2L);
        verify(kafkaTemplate).send(eq("send_connection_request_topic"), eq(2L), any(ConnectionRequestEvent.class));
    }

    @Test
    void testSendConnectionRequest_ThrowsWhenSelfRequest() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> connectionsService.sendConnectionRequest(1L));
        assertTrue(ex.getMessage().contains("same"));
    }

    @Test
    void testSendConnectionRequest_ThrowsWhenAlreadyConnected() {
        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> connectionsService.sendConnectionRequest(2L));
        assertTrue(ex.getMessage().contains("Already connected"));
    }

    @Test
    void testSendConnectionRequest_ThrowsWhenDuplicateRequest() {
        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 2L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> connectionsService.sendConnectionRequest(2L));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void testSendConnectionRequest_ThrowsWhenCrossDuplicateRequest() {
        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 2L)).thenReturn(false);
        when(personRepository.connectionRequestExists(2L, 1L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> connectionsService.sendConnectionRequest(2L));
        assertTrue(ex.getMessage().contains("already sent you a connection request"));
    }

    @Test
    void testAcceptConnectionRequest_Success() {
        when(personRepository.alreadyConnected(2L, 1L)).thenReturn(false);
        when(personRepository.connectionRequestExists(2L, 1L)).thenReturn(true);

        assertDoesNotThrow(() -> connectionsService.acceptConnectionRequest(2L));

        verify(personRepository).acceptConnectionRequest(2L, 1L);
    }

    @Test
    void testGetConnectionStatus_AllStates() {
        assertEquals("SELF", connectionsService.getConnectionStatus(1L));

        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(true);
        assertEquals("CONNECTED", connectionsService.getConnectionStatus(2L));

        when(personRepository.alreadyConnected(1L, 3L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 3L)).thenReturn(true);
        assertEquals("PENDING_SENT", connectionsService.getConnectionStatus(3L));

        when(personRepository.alreadyConnected(1L, 4L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 4L)).thenReturn(false);
        when(personRepository.connectionRequestExists(4L, 1L)).thenReturn(true);
        assertEquals("PENDING_RECEIVED", connectionsService.getConnectionStatus(4L));

        when(personRepository.alreadyConnected(1L, 5L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 5L)).thenReturn(false);
        when(personRepository.connectionRequestExists(5L, 1L)).thenReturn(false);
        assertEquals("NOT_CONNECTED", connectionsService.getConnectionStatus(5L));
    }

    @Test
    void testGetBatchConnectionStatus() {
        when(personRepository.alreadyConnected(1L, 2L)).thenReturn(true);
        when(personRepository.alreadyConnected(1L, 3L)).thenReturn(false);
        when(personRepository.connectionRequestExists(1L, 3L)).thenReturn(true);

        Map<Long, String> statusMap = connectionsService.getBatchConnectionStatus(List.of(1L, 2L, 3L));
        assertEquals("SELF", statusMap.get(1L));
        assertEquals("CONNECTED", statusMap.get(2L));
        assertEquals("PENDING_SENT", statusMap.get(3L));
    }
}
