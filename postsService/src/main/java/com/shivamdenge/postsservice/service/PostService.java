package com.shivamdenge.postsservice.service;

import com.shivamdenge.postsservice.auth.AuthContextHolder;
import com.shivamdenge.postsservice.client.ConnectionsServiceClient;
import com.shivamdenge.postsservice.dto.PersonDto;
import com.shivamdenge.postsservice.dto.PostCreateRequestDto;
import com.shivamdenge.postsservice.dto.PostDto;
import com.shivamdenge.postsservice.entity.Post;
import com.shivamdenge.postsservice.exception.ResourceNotFoundException;
import com.shivamdenge.postsservice.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PostService {

    private final ModelMapper modelMapper;
    private final PostRepository postRepository;
    private final ConnectionsServiceClient connectionsServiceClient;

    public PostDto createPost(PostCreateRequestDto postCreateRequestDto, Long userId) {
        log.info("Creating post for user with id: {}", userId);
        Post post = modelMapper.map(postCreateRequestDto, Post.class);
        post.setUserId(userId);
        post = postRepository.save(post);
        return modelMapper.map(post, PostDto.class);
    }

    public PostDto getPostById(Long postId) {
        log.info("Getting the post with ID: {}", postId);

        Long userId = AuthContextHolder.getCurrentUserId();

//        TODO: Remove in future
//        Call the Connections Service from the Posts Service and pass the userId inside the headers

        List<PersonDto> personDtoList = connectionsServiceClient.getFirstDegreeConnections(userId);

        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found " +
                "with ID: "+postId));
        return modelMapper.map(post, PostDto.class);
    }

    public List<PostDto> getAllPostsOfUser(Long userId) {
        log.info("Getting all the posts of a user with ID: {}", userId);
        List<Post> postList = postRepository.findByUserId(userId);

        return postList
                .stream()
                .map((element) -> modelMapper.map(element, PostDto.class))
                .collect(Collectors.toList());
    }
}
