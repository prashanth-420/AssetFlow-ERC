package com.dto.auth;

import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String email;
    private String organizationName;
    private String department;
    private String password;
}