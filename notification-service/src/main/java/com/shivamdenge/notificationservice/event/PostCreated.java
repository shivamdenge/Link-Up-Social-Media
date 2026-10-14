package com.shivamdenge.notificationservice.event;

import lombok.Data;

@Data
public class PostCreated {
    private Long ownerUserId;
    private Long postId;
    private Long userId;
    private String content;
}
