package com.service;

import com.entity.Employee;
import com.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private final String secret;
    private final long expirationMs;

    public JwtService(@Value("${auth.jwt.secret}") String secret,
                      @Value("${auth.jwt.expiration-ms}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user, String role) {
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("role", role);

        Employee employee = user.getEmployee();
        if (employee != null) {
            claims.put("displayName", buildDisplayName(employee));
            claims.put("employeeId", employee.getId());
        }

        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public io.jsonwebtoken.Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractEmployeeId(String token) {
        Number id = extractAllClaims(token).get("employeeId", Number.class);
        return id != null ? id.longValue() : null;
    }

    public boolean isTokenValid(String token) {
        try {
            io.jsonwebtoken.Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new java.util.Date());
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("AUTH_JWT_SECRET must be at least 32 characters long");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String buildDisplayName(Employee employee) {
        String firstName = StringUtils.hasText(employee.getFirstName()) ? employee.getFirstName().trim() : "";
        String lastName = StringUtils.hasText(employee.getLastName()) ? employee.getLastName().trim() : "";
        String displayName = (firstName + " " + lastName).trim();
        return StringUtils.hasText(displayName) ? displayName : employee.getEmail();
    }
}