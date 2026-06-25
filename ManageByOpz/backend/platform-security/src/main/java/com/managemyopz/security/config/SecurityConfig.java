package com.managemyopz.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.security.filter.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig — Enterprise Spring Security configuration.
 *
 * Enterprise Standard §7 — Security Rules:
 *   - Stateless JWT (no server-side sessions)
 *   - All protected endpoints require Authentication via @PreAuthorize
 *   - 401 and 403 return JSON ApiResponse envelopes, never HTML
 *   - CORS locked to configured allowed origins (not wildcard *)
 *   - BCrypt cost factor read from config (minimum 12)
 *   - @EnableMethodSecurity enables @PreAuthorize on controllers
 *
 * Public endpoints (no token required):
 *   /v1/auth/login
 *   /v1/auth/refresh
 *   /v1/auth/refresh-cookie
 *   /v1/auth/forgot-password
 *   /v1/auth/reset-password
 *   /v1/auth/activate
 *   /actuator/health
 *   /actuator/info
 *   /v3/api-docs/**
 *   /swagger-ui/**
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${platform.security.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOriginsRaw;

    @Value("${platform.security.bcrypt-strength:12}")
    private int bcryptStrength;

    // ── Public endpoints ──────────────────────────────────────────

    private static final String[] PUBLIC_PATHS = {
            // Auth
            "/v1/auth/login",
            "/v1/auth/refresh",
            "/v1/auth/refresh-cookie",
            "/v1/auth/refresh-token",
            "/v1/auth/forgot-password",
            "/v1/auth/reset-password",
            "/v1/auth/activate",
            // Actuator (health probe — no sensitive data)
            "/actuator/health",
            "/actuator/info",
            // API docs
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    // ── Beans ─────────────────────────────────────────────────────

    /**
     * BCrypt password encoder with enterprise-standard cost factor (≥ 12).
     * Cost factor is injected from config — can be raised in production without code changes.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("BCryptPasswordEncoder initialized with strength={}", bcryptStrength);
        return new BCryptPasswordEncoder(bcryptStrength);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Stateless API — no CSRF needed
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // No server-side sessions (JWT is stateless)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Path-based authorization
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(PUBLIC_PATHS).permitAll()
                    // All other requests must be authenticated.
                    // Fine-grained permission checks are done at method level via @PreAuthorize.
                    .anyRequest().authenticated()
            )

            // Custom JSON error responses (instead of Spring's HTML error pages)
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(authenticationEntryPoint())
                    .accessDeniedHandler(accessDeniedHandler())
            )

            // JWT filter runs before Spring's username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── CORS ──────────────────────────────────────────────────────

    /**
     * CORS configuration locked to configured allowed origins.
     * Wildcard (*) is NOT used because credentials (cookies) are included.
     * allowedOriginPatterns is used so that subdomains can be supported via wildcard prefix.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> allowedOrigins = Arrays.asList(allowedOriginsRaw.split(","));
        log.info("CORS configured for {} origins: {}", allowedOrigins.size(), allowedOrigins);

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "X-Tenant-ID", "X-Requested-With",
                "Accept", "Origin", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        config.setExposedHeaders(List.of(
                "Content-Disposition", "Content-Length", "Content-Type",
                "X-Request-ID"
        ));
        config.setAllowCredentials(true);          // Required for HttpOnly cookie refresh token
        config.setMaxAge(3600L);                   // Pre-flight cache: 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ── Error Handlers ────────────────────────────────────────────

    /**
     * AuthenticationEntryPoint — Returns JSON 401 when a protected endpoint is accessed
     * without a valid token.
     *
     * Without this, Spring returns an HTML 401 "Unauthorized" page — unusable by the React SPA.
     */
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response,
                AuthenticationException authException) -> {

            log.warn("401 Unauthorized: uri={} message={}", request.getRequestURI(),
                    authException.getMessage());

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiResponse<Void> body = ApiResponse.<Void>builder()
                    .success(false)
                    .status(401)
                    .errorCode("UNAUTHORIZED")
                    .message("Authentication required. Please log in.")
                    .timestamp(java.time.Instant.now())
                    .build();

            new ObjectMapper()
                    .findAndRegisterModules()
                    .writeValue(response.getOutputStream(), body);
        };
    }

    /**
     * AccessDeniedHandler — Returns JSON 403 when an authenticated user lacks permission.
     *
     * Without this, Spring returns an HTML 403 "Forbidden" page.
     */
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (HttpServletRequest request, HttpServletResponse response,
                AccessDeniedException ex) -> {

            String user = request.getUserPrincipal() != null
                    ? request.getUserPrincipal().getName() : "anonymous";
            log.warn("403 Forbidden: user={} uri={} reason={}", user,
                    request.getRequestURI(), ex.getMessage());

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiResponse<Void> body = ApiResponse.<Void>builder()
                    .success(false)
                    .status(403)
                    .errorCode("ACCESS_DENIED")
                    .message("You do not have permission to perform this action.")
                    .timestamp(java.time.Instant.now())
                    .build();

            new ObjectMapper()
                    .findAndRegisterModules()
                    .writeValue(response.getOutputStream(), body);
        };
    }
}
