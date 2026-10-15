package com.shivamdenge.connectionsservice.controller;
import com.shivamdenge.connectionsservice.entity.Person;
import com.shivamdenge.connectionsservice.service.ConnectionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/core")
@RequiredArgsConstructor
public class ConnectionsController {

    private final ConnectionsService connectionsService;

    @GetMapping("/{userId}/first-degree")
    public ResponseEntity<List<Person>> getFirstDegreeConnections(@PathVariable Long userId) {
        List<Person> personList = connectionsService.getFirstDegreeConnectionsOfUser(userId);
        return ResponseEntity.ok(personList);
    }

    @GetMapping("/requests/received")
    public ResponseEntity<List<Person>> getReceivedConnectionRequests() {
        List<Person> requests = connectionsService.getReceivedConnectionRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<Person>> getSentConnectionRequests() {
        List<Person> requests = connectionsService.getSentConnectionRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<java.util.Map<String, String>> getConnectionStatus(@PathVariable Long userId) {
        String status = connectionsService.getConnectionStatus(userId);
        return ResponseEntity.ok(java.util.Map.of("status", status));
    }

    @PostMapping("/status/batch")
    public ResponseEntity<java.util.Map<Long, String>> getBatchConnectionStatus(@RequestBody List<Long> userIds) {
        java.util.Map<Long, String> statusMap = connectionsService.getBatchConnectionStatus(userIds);
        return ResponseEntity.ok(statusMap);
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<Void> sendConnectionRequest(@PathVariable Long userId) {
        connectionsService.sendConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accept/{userId}")
    public ResponseEntity<Void> acceptConnectionRequest(@PathVariable Long userId) {
        connectionsService.acceptConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<Void> rejectConnectionRequest(@PathVariable Long userId) {
        connectionsService.rejectConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }
}
