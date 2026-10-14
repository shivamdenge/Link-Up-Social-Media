package com.shivamdenge.postsservice.service;

import com.shivamdenge.postsservice.auth.AuthContextHolder;
import com.shivamdenge.postsservice.entity.Post;
import com.shivamdenge.postsservice.entity.PostLike;
import com.shivamdenge.postsservice.event.PostCreated;
import com.shivamdenge.postsservice.event.PostLiked;
import com.shivamdenge.postsservice.exception.BadRequestException;
import com.shivamdenge.postsservice.exception.ResourceNotFoundException;
import com.shivamdenge.postsservice.repository.PostLikeRepository;
import com.shivamdenge.postsservice.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final ModelMapper modelMapper;
    private final KafkaTemplate<Long, PostLiked> postLikedKafkaTemplate;

    @Transactional
    public void likePost(Long postId) {
        Long userId = AuthContextHolder.getCurrentUserId();
        log.info("User with ID: {} liking the post with ID: {}", userId, postId);

        Post post = postRepository.findById(postId).orElseThrow(()
                -> new ResourceNotFoundException("Post not found with ID: "+postId));

        boolean hasAlreadyLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId);
        if(hasAlreadyLiked) throw new BadRequestException("You cannot like the post again");

        PostLike postLike = new PostLike();
        postLike.setPostId(postId);
        postLike.setUserId(userId);
        postLikeRepository.save(postLike);

//        TODO: send notification to the owner of the post
        PostLiked postLiked = PostLiked.builder()
                .postId(postId)
                .likedByUserId(userId)
                .ownerUserId(post.getUserId())
                .build();
        postLikedKafkaTemplate.send("post_liked_topic", postLiked);
    }


    @Transactional
    public void unlikePost(Long postId) {
        Long userId = AuthContextHolder.getCurrentUserId();
        log.info("User with ID: {} unliking the post with ID: {}", userId, postId);

        postRepository.findById(postId).orElseThrow(()
                -> new ResourceNotFoundException("Post not found with ID: "+postId));

        boolean hasAlreadyLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId);
        if(!hasAlreadyLiked) throw new BadRequestException("You cannot unlike the post that you have not liked yet");

        postLikeRepository.deleteByUserIdAndPostId(userId, postId);
    }
}
