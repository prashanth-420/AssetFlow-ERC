package com.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GoogleTokenInfoResponse {
    @JsonProperty("audience")
    private String audience;

    private String email;

    @JsonProperty("email_verified")
    @JsonAlias({"verified_email"})
    private Boolean emailVerified;

    private String name;
    private String picture;
    private String sub;
}