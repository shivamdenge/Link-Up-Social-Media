package com.shivamdenge.connectionsservice.service;

import com.shivamdenge.connectionsservice.auth.AuthContextHolder;
import com.shivamdenge.connectionsservice.entity.Person;
import com.shivamdenge.connectionsservice.event.ConnectionRequestEvent;
import com.shivamdenge.connectionsservice.exception.BadRequestException;
import com.shivamdenge.connectionsservice.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConnectionsService {

    private final PersonRepository personRepository;
    private final KafkaTemplate<Long, ConnectionRequestEvent> connectionRequestKafkaTemplate;

    public List<Person> getFirstDegreeConnectionsOfUser(Long userId) {
        log.info("Getting first degree connections of user with ID: {}", userId);

        return personRepository.getFirstDegreeConnections(userId);
    }

    public List<Person> getReceivedConnectionRequests() {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        log.info("Getting received connection requests for user ID: {}", currentUserId);
        return personRepository.getReceivedConnectionRequests(currentUserId);
    }

    public List<Person> getSentConnectionRequests() {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        log.info("Getting sent connection requests for user ID: {}", currentUserId);
        return personRepository.getSentConnectionRequests(currentUserId);
    }

    public String getConnectionStatus(Long targetUserId) {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        if (currentUserId == null || targetUserId == null) {
            return "NOT_CONNECTED";
        }
        if (currentUserId.equals(targetUserId)) {
            return "SELF";
        }
        if (personRepository.alreadyConnected(currentUserId, targetUserId)) {
            return "CONNECTED";
        }
        if (personRepository.connectionRequestExists(currentUserId, targetUserId)) {
            return "PENDING_SENT";
        }
        if (personRepository.connectionRequestExists(targetUserId, currentUserId)) {
            return "PENDING_RECEIVED";
        }
        return "NOT_CONNECTED";
    }

    public Map<Long, String> getBatchConnectionStatus(List<Long> targetUserIds) {
        Map<Long, String> statusMap = new HashMap<>();
        if (targetUserIds == null || targetUserIds.isEmpty()) {
            return statusMap;
        }
        for (Long targetUserId : targetUserIds) {
            statusMap.put(targetUserId, getConnectionStatus(targetUserId));
        }
        return statusMap;
    }

    public void sendConnectionRequest(Long receiverId) {
        Long senderId = AuthContextHolder.getCurrentUserId();
        log.info("sending connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        boolean alreadyConnected = personRepository.alreadyConnected(senderId, receiverId);
        if (alreadyConnected) {
            throw new BadRequestException("Already connected users, cannot add connection request");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        if (alreadySentRequest) {
            throw new BadRequestException("Connection request already exists, cannot send again");
        }

        boolean receiverSentRequest = personRepository.connectionRequestExists(receiverId, senderId);
        if (receiverSentRequest) {
            throw new BadRequestException("This user has already sent you a connection request. Please accept it.");
        }

        personRepository.addConnectionRequest(senderId, receiverId);
        log.info("Successfully sent the connection request");

        try {
            String senderName = personRepository.findByUserId(senderId)
                    .map(Person::getName)
                    .orElse("Someone");

            ConnectionRequestEvent event = ConnectionRequestEvent.builder()
                    .senderId(senderId)
                    .receiverId(receiverId)
                    .senderName(senderName)
                    .build();

            connectionRequestKafkaTemplate.send("send_connection_request_topic", receiverId, event);
            log.info("Published ConnectionRequestEvent to kafka: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish ConnectionRequestEvent to Kafka", e);
        }
    }

    public void acceptConnectionRequest(Long senderId) {
        Long receiverId = AuthContextHolder.getCurrentUserId();
        log.info("Accepting a connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        boolean alreadyConnected = personRepository.alreadyConnected(senderId, receiverId);
        if (alreadyConnected) {
            throw new BadRequestException("Already connected users, cannot accept connection request again");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        if (!alreadySentRequest) {
            throw new BadRequestException("No Connection request exists, cannot accept without request");
        }

        personRepository.acceptConnectionRequest(senderId, receiverId);

        log.info("Successfully accepted the connection request with senderId: {}, receiverId: {}", senderId,
                receiverId);

    }

    public void rejectConnectionRequest(Long senderId) {
        Long receiverId = AuthContextHolder.getCurrentUserId();
        log.info("Rejecting a connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        if (!alreadySentRequest) {
            throw new BadRequestException("No Connection request exists, cannot reject it");
        }

        personRepository.rejectConnectionRequest(senderId, receiverId);

        log.info("Successfully rejected the connection request with senderId: {}, receiverId: {}", senderId,
                receiverId);
    }
}
