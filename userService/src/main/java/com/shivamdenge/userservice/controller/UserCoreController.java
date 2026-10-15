package com.shivamdenge.userservice.controller;

import com.shivamdenge.userservice.dto.UserDto;
import com.shivamdenge.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/core", ""})
@RequiredArgsConstructor
public class UserCoreController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam("query") String query) {
        List<UserDto> results = userService.searchUsers(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
}
