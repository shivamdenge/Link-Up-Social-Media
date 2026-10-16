package com.shivamdenge.userservice.controller;

import com.shivamdenge.userservice.dto.UserDto;
import com.shivamdenge.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/core", ""})
@RequiredArgsConstructor
public class UserCoreController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam(value = "query", required = false) String query) {
        List<UserDto> results = userService.searchUsers(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<UserDto>> getEligibleUsers(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        List<UserDto> results = userService.getEligibleUsers(currentUserId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping(value = "/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> uploadProfilePhoto(
            @RequestHeader(value = "X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        UserDto updated = userService.updateProfilePhoto(userId, file);
        return ResponseEntity.ok(updated);
    }
}

