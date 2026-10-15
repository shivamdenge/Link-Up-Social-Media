package com.shivamdenge.userservice.service;

import com.shivamdenge.userservice.dto.UserDto;
import com.shivamdenge.userservice.entity.User;
import com.shivamdenge.userservice.exception.BadRequestException;
import com.shivamdenge.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public List<UserDto> searchUsers(String query) {
        log.info("Searching users with query: {}", query);
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        List<User> users = userRepository.findByNameContainingIgnoreCase(query.trim());
        return users.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long userId) {
        log.info("Getting user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with ID: " + userId));
        return modelMapper.map(user, UserDto.class);
    }
}
