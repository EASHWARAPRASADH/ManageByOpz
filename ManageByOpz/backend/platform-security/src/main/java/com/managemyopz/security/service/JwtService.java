package com.managemyopz.security.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * JwtService — Handles JWT token generation, validation, and claim extraction.
 *
 * Enterprise Standard §ADR-002 — Token Structure:
 *   - Access Token  : 15 minutes, stored in-memory (Redux state)
 *   - Refresh Token : 7 days, stored in HttpOnly Secure cookie
 *
 * Standard Access Token Claims:
 *   sub         → email (subject)
 *   userId      → String UUID of User entity
 *   tenantId    → tenant/org identifier
 *   role        → primary role code (e.g. ROLE_HR_MANAGER)
 *   permissions → List<String> of permission keys (e.g. ["hr:employee:read"])
 *   sessionId   → UUID for server-side session tracking (AD_SESSION)
 *   iat / exp   → issued at / expiry (standard JWT claims)
 *
 * Signing Algorithm: HS512 (requires 512-bit / 64-byte key).
 */
@Slf4j
@Service
public class JwtService {

    @Value("${platform.security.jwt.secret:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBIUyA1MTIgYWxnb3JpdGhtIHRoYXQgbmVlZHMgdG8gYmUgYXQgbGVhc3QgNjQgYnl0ZXMgbG9uZw==}")
    private String secretKey;

    @Value("${platform.security.jwt.expiration:900000}")
    private long expiration;            // Default: 15 minutes

    @Value("${platform.security.jwt.refresh-expiration:604800000}")
    private long refreshExpiration;     // Default: 7 days

    // ── Access Token ──────────────────────────────────────────────

    /**
     * Generates a signed access token with the enterprise standard claim set.
     *
     * @param userId      User entity UUID string
     * @param email       User email address (JWT subject)
     * @param tenantId    Tenant/org identifier
     * @param role        Primary role code
     * @param permissions List of permission keys granted to this user
     * @return Signed JWT access token string
     */
    public String generateToken(String userId, String email, String tenantId,
                                String role, List<String> permissions) {
        String sessionId = UUID.randomUUID().toString();
        return generateToken(userId, email, tenantId, role, permissions, sessionId);
    }

    /**
     * Generates a signed access token with explicit sessionId.
     * Used internally when correlating a token to an existing AD_SESSION row.
     */
    public String generateToken(String userId, String email, String tenantId,
                                String role, List<String> permissions, String sessionId) {
        return Jwts.builder()
                .subject(email)
                .claims(Map.of(
                        "userId",      userId      != null ? userId      : "",
                        "tenantId",    tenantId    != null ? tenantId    : "",
                        "role",        role        != null ? role        : "",
                        "permissions", permissions != null ? permissions : List.of(),
                        "sessionId",   sessionId   != null ? sessionId   : UUID.randomUUID().toString()
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Legacy overload — kept for backward compatibility with existing callers
     * that pass role + employeeId without a permission list.
     */
    public String generateToken(String username, String tenantId, String role, String employeeId) {
        return generateToken(
                employeeId != null ? employeeId : "unknown",
                username, tenantId, role, List.of()
        );
    }

    // ── Refresh Token ─────────────────────────────────────────────

    /**
     * Generates a refresh token stored in an HttpOnly cookie.
     * Carries minimal claims — only the subject and tenantId.
     * Type claim differentiates it from access tokens to prevent misuse.
     */
    public String generateRefreshToken(String username, String tenantId) {
        return Jwts.builder()
                .subject(username)
                .claims(Map.of(
                        "tenantId", tenantId != null ? tenantId : "",
                        "type",     "refresh"
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Extraction Helpers ────────────────────────────────────────

    /** Extracts the subject (email) from any token. */
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    /** Extracts the tenantId custom claim. */
    public String extractTenantId(String token) {
        return extractClaims(token).get("tenantId", String.class);
    }

    /** Extracts the primary role code. */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /** Extracts the userId (User entity UUID string). */
    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }

    /** Extracts the sessionId for server-side session validation. */
    public String extractSessionId(String token) {
        return extractClaims(token).get("sessionId", String.class);
    }

    /**
     * Extracts the permissions list from the token claims.
     * Returns an empty list if the claim is absent or malformed.
     */
    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        try {
            Object perms = extractClaims(token).get("permissions");
            if (perms instanceof List) {
                return (List<String>) perms;
            }
        } catch (Exception e) {
            log.debug("Could not extract permissions from token: {}", e.getMessage());
        }
        return List.of();
    }

    /**
     * Returns true if the token is structurally valid and not expired.
     * Does NOT check session revocation — that happens in JwtAuthenticationFilter.
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Returns true if this is a refresh token (type = "refresh").
     * Prevents refresh tokens from being used as access tokens.
     */
    public boolean isRefreshToken(String token) {
        try {
            String type = extractClaims(token).get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    // ── Internal ─────────────────────────────────────────────────

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
