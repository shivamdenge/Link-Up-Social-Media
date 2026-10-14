package com.shivamdenge.uploaderservice.service;

import org.springframework.web.multipart.MultipartFile;

public interface UploaderService {

     String upload(MultipartFile file);
}
