package com.shivamdenge.postsservice.service;

import com.shivamdenge.postsservice.auth.AuthContextHolder;
import com.shivamdenge.postsservice.client.ConnectionsServiceClient;
import com.shivamdenge.postsservice.client.UploaderServiceClient;
import com.shivamdenge.postsservice.dto.PostCreateRequestDto;
import com.shivamdenge.postsservice.dto.PostDto;
import com.shivamdenge.postsservice.entity.Post;
import com.shivamdenge.postsservice.event.PostCreated;
import com.shivamdenge.postsservice.exception.BadRequestException;
import com.shivamdenge.postsservice.exception.ResourceNotFoundException;
import com.shivamdenge.postsservice.repository.PostLikeRepository;
import com.shivamdenge.postsservice.repository.PostRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private ConnectionsServiceClient connectionsServiceClient;

    @Mock
    private KafkaTemplate<Long, PostCreated> postCreatedKafkaTemplate;

    @Mock
    private UploaderServiceClient uploaderServiceClient;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private PostService postService;

    @BeforeEach
    void setUp() {
        AuthContextHolder.setCurrentUserId(100L);
    }

    @AfterEach
    void tearDown() {
        AuthContextHolder.clear();
    }

    @Test
    void testCreatePost_TextOnly_Success() {
        PostCreateRequestDto requestDto = new PostCreateRequestDto();
        requestDto.setContent("Hello World! This is a text-only post.");

        Post savedPost = new Post();
        savedPost.setId(1L);
        savedPost.setUserId(100L);
        savedPost.setContent("Hello World! This is a text-only post.");

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        PostDto result = postService.createPost(requestDto, null);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Hello World! This is a text-only post.", result.getContent());
        assertNull(result.getImageUrl());
        verifyNoInteractions(uploaderServiceClient);
    }

    @Test
    void testGetFeed_ReturnsAllPostsDescending() {
        Post p1 = new Post();
        p1.setId(1L);
        p1.setContent("First");

        Post p2 = new Post();
        p2.setId(2L);
        p2.setContent("Second");

        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(p2, p1));

        List<PostDto> feed = postService.getFeed(100L);
        assertEquals(2, feed.size());
        assertEquals("Second", feed.get(0).getContent());
        assertEquals("First", feed.get(1).getContent());
    }

    @Test
    void testDeletePost_AuthorizedOwner_Success() {
        Post post = new Post();
        post.setId(10L);
        post.setUserId(100L);

        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        postService.deletePost(10L);

        verify(postLikeRepository).deleteByPostId(10L);
        verify(postRepository).delete(post);
    }

    @Test
    void testDeletePost_UnauthorizedThrowsBadRequest() {
        Post post = new Post();
        post.setId(10L);
        post.setUserId(999L); // Different user

        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        assertThrows(BadRequestException.class, () -> postService.deletePost(10L));
        verify(postRepository, never()).delete(any());
        verify(postLikeRepository, never()).deleteByPostId(any());
    }

    @Test
    void testDeletePost_NotFoundThrowsResourceNotFound() {
        when(postRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postService.deletePost(999L));
    }
}
