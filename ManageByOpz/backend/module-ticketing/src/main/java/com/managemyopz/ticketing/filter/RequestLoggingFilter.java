package com.managemyopz.ticketing.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * RequestLoggingFilter — Structured per-request logging with MDC context.
 *
 * Adds the following MDC fields to every log line for every request:
 *   - requestId : unique UUID per request (for tracing in logs/Grafana)
 *   - userId    : the authenticated user (from SecurityContext)
 *   - method    : HTTP method (GET, POST, etc.)
 *   - uri       : request path
 *
 * Also emits a structured INFO log line at the END of each request:
 *   METHOD=POST URI=/api/tickets STATUS=201 DURATION=45ms USER=john@acme.com IP=127.0.0.1
 *
 * Enterprise Standard §4 — ALL request logs MUST include these MDC fields.
 * Never use System.out.println — always use SLF4J with MDC.
 *
 * Runs at the HIGHEST precedence to ensure all downstream logs carry MDC.
 */
@Slf4j
@Component("ticketingRequestLoggingFilter")
@Order(Integer.MIN_VALUE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String MDC_REQUEST_ID = "requestId";
    private static final String MDC_USER_ID    = "userId";
    private static final String MDC_METHOD     = "method";
    private static final String MDC_URI        = "uri";

    // Health-check paths we skip to avoid log noise
    private static final String[] SKIP_PATHS = {
            "/actuator/health",
            "/actuator/info",
            "/favicon.ico"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestId = UUID.randomUUID().toString();
        long startTime   = System.currentTimeMillis();

        try {
            // Populate MDC for all downstream logs
            MDC.put(MDC_REQUEST_ID, requestId);
            MDC.put(MDC_METHOD,     request.getMethod());
            MDC.put(MDC_URI,        request.getRequestURI());

            filterChain.doFilter(request, response);

        } finally {
            // After chain — enrich with user that was resolved during the request
            String userId   = resolveCurrentUser();
            if (userId != null) MDC.put(MDC_USER_ID, userId);

            long duration = System.currentTimeMillis() - startTime;
            int  status   = response.getStatus();

            // Structured request log line — parse-friendly for Grafana Loki / ELK
            if (status >= 500) {
                log.error("METHOD={} URI={} STATUS={} DURATION={}ms USER={} IP={} REQUEST_ID={}",
                        request.getMethod(), request.getRequestURI(), status, duration,
                        userId, request.getRemoteAddr(), requestId);
            } else if (status >= 400) {
                log.warn("METHOD={} URI={} STATUS={} DURATION={}ms USER={} IP={} REQUEST_ID={}",
                        request.getMethod(), request.getRequestURI(), status, duration,
                        userId, request.getRemoteAddr(), requestId);
            } else {
                log.info("METHOD={} URI={} STATUS={} DURATION={}ms USER={} IP={} REQUEST_ID={}",
                        request.getMethod(), request.getRequestURI(), status, duration,
                        userId, request.getRemoteAddr(), requestId);
            }

            // Always clear MDC to prevent leaks across thread pool reuse
            MDC.remove(MDC_REQUEST_ID);
            MDC.remove(MDC_USER_ID);
            MDC.remove(MDC_METHOD);
            MDC.remove(MDC_URI);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────

    private boolean shouldSkip(HttpServletRequest request) {
        String uri = request.getRequestURI();
        for (String path : SKIP_PATHS) {
            if (uri.startsWith(path)) return true;
        }
        return false;
    }

    private String resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception ignored) {
            // SecurityContext may not be populated yet on some paths
        }
        return "anonymous";
    }
}
