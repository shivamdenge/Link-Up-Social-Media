package com.shivamdenge.postsservice.controller;

import com.shivamdenge.postsservice.dto.PostCreateRequestDto;
import com.shivamdenge.postsservice.dto.PostDto;
import com.shivamdenge.postsservice.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/core")
public class PostController {

    private final PostService postService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> createPost(
            @RequestPart("post") PostCreateRequestDto postCreateRequestDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        PostDto postDto = postService.createPost(postCreateRequestDto, file);
        return new ResponseEntity<>(postDto, HttpStatus.CREATED);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostDto>> getFeed(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<PostDto> feed = postService.getFeed(userId);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/{postId:[0-9]+}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long postId){
        PostDto postDto = postService.getPostById(postId);
        return ResponseEntity.ok(postDto);
    }

    @GetMapping("/users/{userId:[0-9]+}/allPosts")
    public ResponseEntity<List<PostDto>> getAllPostsOfUser(@PathVariable Long userId){
        List<PostDto> postDtoList = postService.getAllPostsOfUser(userId);
        return ResponseEntity.ok(postDtoList);
    }

    @DeleteMapping("/{postId:[0-9]+}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }
}

