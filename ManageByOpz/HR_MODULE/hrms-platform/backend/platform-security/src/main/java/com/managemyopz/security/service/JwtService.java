package com.managemyopz.security.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

/**
 * JwtService — Handles JWT token generation, validation, and claim extraction.
 * Tokens carry: username, tenantId, roles, employeeId for stateless auth.
 */
@Service
public class JwtService {

    @Value("${platform.security.jwt.secret:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBIUyA1MTIgYWxnb3JpdGhtIHRoYXQgbmVlZHMgdG8gYmUgYXQgbGVhc3QgNjQgYnl0ZXMgbG9uZw==}")
    private String secretKey;

    @Value("${platform.security.jwt.expiration:86400000}")
    private long expiration; // 24 hours default

    @Value("${platform.security.jwt.refresh-expiration:604800000}")
    private long refreshExpiration; // 7 days default

    public String generateToken(String username, String tenantId, String role, String employeeId) {
        return generateToken(employeeId != null ? employeeId : "unknown-id", username, tenantId, role, java.util.List.of());
    }

    public String generateToken(String userId, String email, String tenantId, String role, java.util.List<String> permissions) {
        return Jwts.builder()
                .subject(email)
                .claims(Map.of(
                        "userId", userId != null ? userId : "",
                        "email", email != null ? email : "",
                        "tenantId", tenantId != null ? tenantId : "",
                        "role", role != null ? role : "",
                        "permissions", permissions != null ? permissions : java.util.List.of()
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username, String tenantId) {
        return Jwts.builder()
                .subject(username)
                .claims(Map.of("tenantId", tenantId, "type", "refresh"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractTenantId(String token) {
        return extractClaims(token).get("tenantId", String.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
