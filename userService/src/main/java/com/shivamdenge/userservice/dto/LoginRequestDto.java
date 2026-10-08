package com.shivamdenge.userservice.dto;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String email, password;
}
