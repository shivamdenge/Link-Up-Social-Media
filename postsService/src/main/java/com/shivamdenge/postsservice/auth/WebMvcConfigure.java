package com.shivamdenge.postsservice.auth;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfigure implements WebMvcConfigurer  {

    private final RequestInterceptor requestInterceptor;

    public WebMvcConfigure(RequestInterceptor requestInterceptor) {
        this.requestInterceptor = requestInterceptor;
    }

    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requestInterceptor);
        WebMvcConfigurer.super.addInterceptors(registry);
    }
}
