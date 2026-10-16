package com.shivamdenge.postsservice.service;

import com.shivamdenge.postsservice.auth.AuthContextHolder;
import com.shivamdenge.postsservice.client.ConnectionsServiceClient;
import com.shivamdenge.postsservice.client.UploaderServiceClient;
import com.shivamdenge.postsservice.dto.PersonDto;
import com.shivamdenge.postsservice.dto.PostCreateRequestDto;
import com.shivamdenge.postsservice.dto.PostDto;
import com.shivamdenge.postsservice.entity.Post;
import com.shivamdenge.postsservice.event.PostCreated;
import com.shivamdenge.postsservice.exception.BadRequestException;
import com.shivamdenge.postsservice.exception.ResourceNotFoundException;
import com.shivamdenge.postsservice.repository.PostLikeRepository;
import com.shivamdenge.postsservice.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PostService {

    private final ModelMapper modelMapper;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final ConnectionsServiceClient connectionsServiceClient;
    private final KafkaTemplate<Long, PostCreated> postCreatedKafkaTemplate;
    private final UploaderServiceClient uploaderServiceClient;

    public PostDto createPost(PostCreateRequestDto postCreateRequestDto, MultipartFile file) {
        Long userId = AuthContextHolder.getCurrentUserId();
        log.info("Creating post for user with id: {}", userId);

        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                // Post media upload exclusively uses Cloudinary
                ResponseEntity<String> uploadResponse = uploaderServiceClient.uploadFile(file);
                if (uploadResponse != null && uploadResponse.getBody() != null) {
                    imageUrl = uploadResponse.getBody();
                }
            } catch (Exception e) {
                log.warn("File upload to Cloudinary failed: {}", e.getMessage());
            }
        }

        Post post = modelMapper.map(postCreateRequestDto, Post.class);
        post.setUserId(userId);
        post.setImageUrl(imageUrl);
        post = postRepository.save(post);

        try {
            List<PersonDto> personDtoList = connectionsServiceClient.getFirstDegreeConnections(userId);
            if (personDtoList != null) {
                for (PersonDto person : personDtoList) {
                    PostCreated postCreated = PostCreated.builder()
                            .postId(post.getId())
                            .content(post.getContent())
                            .userId(person.getUserId())
                            .ownerUserId(userId)
                            .build();
                    postCreatedKafkaTemplate.send("post_created_topic", postCreated);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to publish post notifications to connections: {}", e.getMessage());
        }

        return modelMapper.map(post, PostDto.class);
    }

    public List<PostDto> getFeed(Long userId) {
        log.info("Retrieving feed for user: {}", userId);
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(element -> modelMapper.map(element, PostDto.class))
                .collect(Collectors.toList());
    }

    public PostDto getPostById(Long postId) {
        log.info("Getting the post with ID: {}", postId);
        Post post = postRepository.findById(postId).orElseThrow(() ->
                new ResourceNotFoundException("Post not found with ID: " + postId));
        return modelMapper.map(post, PostDto.class);
    }

    public List<PostDto> getAllPostsOfUser(Long userId) {
        log.info("Getting all the posts of a user with ID: {}", userId);
        List<Post> postList = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return postList.stream()
                .map(element -> modelMapper.map(element, PostDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long postId) {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        log.info("Attempting to delete post with ID: {} by user: {}", postId, currentUserId);

        Post post = postRepository.findById(postId).orElseThrow(() ->
                new ResourceNotFoundException("Post not found with ID: " + postId));

        if (!post.getUserId().equals(currentUserId)) {
            log.warn("Unauthorized attempt to delete post {}: owner is {}, requesting user is {}",
                    postId, post.getUserId(), currentUserId);
            throw new BadRequestException("Unauthorized: You can only delete your own posts");
        }

        postLikeRepository.deleteByPostId(postId);
        postRepository.delete(post);
        log.info("Successfully deleted post with ID: {}", postId);
    }
}

