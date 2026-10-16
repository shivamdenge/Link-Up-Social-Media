package com.shivamdenge.uploaderservice.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service("googleCloudStorageUploaderService")
@RequiredArgsConstructor
public class GoogleCloudStorageUploaderService implements UploaderService{

    private final Storage storage;

    @Value("${gcloud.storage-bucket-name}")
    private String bucketName;

    @Override
    public String upload(MultipartFile file) {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String fileName = UUID.randomUUID() + "-" + originalFilename;
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                .setContentType(contentType)
                .build();
        try {
            storage.create(blobInfo, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Google Cloud Storage: " + e.getMessage(), e);
        }
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }
}