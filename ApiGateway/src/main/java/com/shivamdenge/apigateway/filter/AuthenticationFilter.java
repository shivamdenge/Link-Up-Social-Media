package com.shivamdenge.apigateway.filter;

import com.shivamdenge.apigateway.JwtService;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtService jwtService;

    public AuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();

        // Allow CORS preflight OPTIONS requests
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        String path = request.getURI().getPath();

        // Allow public endpoints and health checks
        if (path.equals("/api/v1/users/auth/login") || path.equals("/api/v1/users/auth/signup") || path.equals("/") || path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            String userId = jwtService.getUserIdFromToken(token);

            ServerHttpRequest modifiedRequest = request.mutate().headers(headers -> {
                headers.set("X-User-Id", userId);
            }).build();

            ServerWebExchange modifiedExchange = exchange.mutate().request(modifiedRequest).build();

            return chain.filter(modifiedExchange);

        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());

            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
