package com.service;

import com.dto.auth.GoogleTokenInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GoogleTokenService {

    @Value("${auth.google.client-id}")
    private String googleClientId;

    private static final Pattern STRING_FIELD = Pattern.compile("\"%s\"\\s*:\\s*\"([^\"]*)\"");
    private static final Pattern BOOLEAN_FIELD = Pattern.compile("\"%s\"\\s*:\\s*(true|false)");

    public GoogleTokenInfoResponse verifyAccessToken(String accessToken) {
        if (!StringUtils.hasText(accessToken)) {
            throw new IllegalArgumentException("Google access token is required.");
        }

        try {
            URL url = URI.create("https://oauth2.googleapis.com/tokeninfo?access_token=" + accessToken).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            int status = connection.getResponseCode();
            InputStream stream = status >= 200 && status < 300 ? connection.getInputStream() : connection.getErrorStream();
            if (stream == null) {
                throw new IllegalStateException("Unable to verify Google token.");
            }

            String body = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            if (status < 200 || status >= 300) {
                throw new IllegalStateException("Google token verification failed: " + body);
            }

            GoogleTokenInfoResponse response = new GoogleTokenInfoResponse();
            response.setAudience(extractString(body, "aud"));
            response.setEmail(extractString(body, "email"));
            response.setEmailVerified(resolveEmailVerified(body));
            response.setName(extractString(body, "name"));
            response.setPicture(extractString(body, "picture"));
            response.setSub(extractString(body, "sub"));

            if (!googleClientId.equals(response.getAudience())) {
                throw new IllegalStateException("Google token audience does not match the configured client id.");
            }
            if (Boolean.FALSE.equals(response.getEmailVerified())) {
                throw new IllegalStateException("Google account email is not verified.");
            }

            return response;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to verify Google token.", exception);
        }
    }

    private String extractString(String body, String fieldName) {
        Matcher matcher = Pattern.compile(String.format(STRING_FIELD.pattern(), Pattern.quote(fieldName))).matcher(body);
        return matcher.find() ? matcher.group(1) : null;
    }

    private Boolean extractBoolean(String body, String fieldName) {
        Matcher matcher = Pattern.compile(String.format(BOOLEAN_FIELD.pattern(), Pattern.quote(fieldName))).matcher(body);
        return matcher.find() ? Boolean.valueOf(matcher.group(1)) : null;
    }

    private Boolean resolveEmailVerified(String body) {
        Boolean emailVerified = extractBoolean(body, "email_verified");
        if (Boolean.TRUE.equals(emailVerified)) {
            return true;
        }

        Boolean verifiedEmail = extractBoolean(body, "verified_email");
        if (Boolean.TRUE.equals(verifiedEmail)) {
            return true;
        }

        return emailVerified != null ? emailVerified : verifiedEmail;
    }
}