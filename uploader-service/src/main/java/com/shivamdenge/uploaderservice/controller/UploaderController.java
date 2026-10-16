package com.shivamdenge.uploaderservice.controller;

import com.shivamdenge.uploaderservice.service.UploaderService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/file")
public class UploaderController {

    private final UploaderService cloudinaryUploaderService;
    private final UploaderService googleCloudStorageUploaderService;

    public UploaderController(
            @Qualifier("cloudinaryUploaderService") UploaderService cloudinaryUploaderService,
            @Qualifier("googleCloudStorageUploaderService") UploaderService googleCloudStorageUploaderService) {
        this.cloudinaryUploaderService = cloudinaryUploaderService;
        this.googleCloudStorageUploaderService = googleCloudStorageUploaderService;
    }

    /**
     * Post images and media exclusively use Cloudinary.
     */
    @PostMapping
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryUploaderService.upload(file);
        return ResponseEntity.ok(url);
    }

    /**
     * Profile photos strictly use Google Cloud Storage (GCS).
     */
    @PostMapping("/profile")
    public ResponseEntity<String> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        String url = googleCloudStorageUploaderService.upload(file);
        return ResponseEntity.ok(url);
    }
}

