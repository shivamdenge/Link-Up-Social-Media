package com.shivamdenge.connectionsservice.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestInterceptor implements HandlerInterceptor {

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String userId = request.getHeader("X-User-Id");
        if (userId != null && !userId.isBlank()) {
            AuthContextHolder.setCurrentUserId(Long.valueOf(userId));
        }
        return HandlerInterceptor.super.preHandle(request,response,handler);
    }

    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                 @Nullable Exception ex) throws Exception {
        AuthContextHolder.clear();
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }


}
