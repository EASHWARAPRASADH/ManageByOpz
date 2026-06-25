package com.managemyopz.security.filter;

import com.managemyopz.security.service.JwtService;
import com.managemyopz.shared.entity.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JwtAuthenticationFilter — Validates access tokens on every request.
 *
 * Enterprise Standard §ADR-002 — Token extraction priority:
 *   1. Authorization: Bearer {token} header (API clients, frontend)
 *   2. ?token= query param is DISABLED in production (dev/test only)
 *
 * On successful validation, this filter:
 *   - Populates Spring SecurityContextHolder with the authenticated user
 *   - Sets the full permissions list as GrantedAuthority objects
 *   - Populates TenantContext for downstream multi-tenant filtering
 *   - Sets MDC fields (userId, tenantId) for structured logging
 *
 * On failure, it does NOT throw — the request continues unauthenticated.
 * Access control is enforced by @PreAuthorize on each controller method.
 *
 * Security hardening:
 *   - Refresh tokens presented as access tokens are rejected
 *   - Unauthenticated requests to protected endpoints get 401 JSON (via AuthEntryPoint)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = extractToken(request);

        if (jwt != null) {
            try {
                // Reject refresh tokens used as access tokens
                if (jwtService.isRefreshToken(jwt)) {
                    log.warn("Refresh token presented as access token — rejected. URI={}",
                            request.getRequestURI());
                } else if (jwtService.isTokenValid(jwt)) {
                    authenticateRequest(jwt, request);
                }
            } catch (Exception e) {
                log.warn("JWT processing failed: {} uri={}", e.getMessage(), request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }

    // ── Token Extraction ──────────────────────────────────────────

    /**
     * Extracts the JWT from the request. Checks:
     *   1. Authorization: Bearer header
     *   2. Refresh cookie (for reading sessionId only — not auth)
     */
    private String extractToken(HttpServletRequest request) {
        // 1. Authorization header (primary source)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. No other extraction in production — query param ?token= is removed for security
        // It was removed because URL parameters appear in server logs, browser history, and
        // referrer headers, all of which expose the token.
        return null;
    }

    // ── Authentication Population ─────────────────────────────────

    private void authenticateRequest(String jwt, HttpServletRequest request) {
        String email     = jwtService.extractUsername(jwt);
        String tenantId  = jwtService.extractTenantId(jwt);
        String userId    = jwtService.extractUserId(jwt);
        String role      = jwtService.extractRole(jwt);
        String sessionId = jwtService.extractSessionId(jwt);
        List<String> permissions = jwtService.extractPermissions(jwt);

        if (email == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        // Build authorities: role + all individual permissions
        // This enables both @PreAuthorize("hasRole('HR_MANAGER')") and
        // @PreAuthorize("hasAuthority('hr:employee:read')") simultaneously
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority(role)); // e.g. ROLE_HR_MANAGER
        }
        permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .forEach(authorities::add);

        // Set Spring Security context
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null, authorities);
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // Set TenantContext for Hibernate filter + downstream use
        if (tenantId != null && !tenantId.isBlank()) {
            TenantContext.setCurrentTenant(tenantId);
        }
        TenantContext.setCurrentUser(email);
        if (userId != null) {
            TenantContext.setCurrentUserId(userId);
        }
        if (role != null) {
            TenantContext.setCurrentRole(role);
        }

        // Enrich MDC for structured logging
        MDC.put("userId",    email);
        MDC.put("tenantId",  tenantId != null ? tenantId : "");
        MDC.put("sessionId", sessionId != null ? sessionId : "");

        log.debug("Authenticated: user={} tenant={} role={} permissions={} session={}",
                email, tenantId, role, permissions.size(), sessionId);
    }
}
