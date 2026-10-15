package com.shivamdenge.connectionsservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionRequestEvent {
    private Long senderId;
    private Long receiverId;
    private String senderName;
}
