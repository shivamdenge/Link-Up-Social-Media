package com.shivamdenge.userservice.service;

import com.shivamdenge.userservice.dto.UserDto;
import com.shivamdenge.userservice.entity.User;
import com.shivamdenge.userservice.exception.BadRequestException;
import com.shivamdenge.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Value("${uploader.service.uri:http://localhost:9050}")
    private String uploaderServiceUri;

    public List<UserDto> searchUsers(String query) {
        log.info("Searching users with query: {}", query);
        List<User> users;
        if (query == null || query.trim().isEmpty()) {
            users = userRepository.findAll();
        } else {
            users = userRepository.findByNameContainingIgnoreCase(query.trim());
        }
        return users.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    public List<UserDto> getEligibleUsers(Long currentUserId) {
        log.info("Fetching eligible users for discovery (excluding user: {})", currentUserId);
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long userId) {
        log.info("Getting user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with ID: " + userId));
        return modelMapper.map(user, UserDto.class);
    }

    public UserDto updateProfilePhoto(Long userId, MultipartFile file) {
        log.info("Updating profile photo for user: {}", userId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded profile photo file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Invalid file type. Only images are permitted for profile photos");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with ID: " + userId));

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            String gcsUrl = RestClient.create(uploaderServiceUri)
                    .post()
                    .uri("/uploads/file/profile")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            log.info("Successfully uploaded profile photo to GCS: {}", gcsUrl);
            user.setProfileImageUrl(gcsUrl);
            user = userRepository.save(user);

            return modelMapper.map(user, UserDto.class);
        } catch (Exception e) {
            log.error("Failed to upload profile photo to GCS via uploader-service: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to upload profile photo: " + e.getMessage());
        }
    }
}

