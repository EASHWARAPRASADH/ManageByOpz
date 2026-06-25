package com.managemyopz.shared.filter;

import com.managemyopz.shared.entity.TenantContext;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * TenantFilter — Extracts tenant information from every request and populates TenantContext.
 *
 * Tenant ID is extracted from:
 * 1. X-Tenant-ID header (for API clients)
 * 2. JWT claims (populated by security filter)
 * 3. Subdomain parsing (future: acme.managemyopz.com)
 *
 * This runs BEFORE the security filter to ensure tenant context is available
 * for all downstream processing.
 */
@Slf4j
@Component
@Order(1)
public class TenantFilter implements Filter {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String DEFAULT_TENANT = "default";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = httpRequest.getHeader(TENANT_HEADER);
            if (tenantId == null || tenantId.isBlank()) {
                // Fallback: extract from subdomain or use default
                tenantId = extractFromSubdomain(httpRequest);
            }
        }

        TenantContext.setCurrentTenant(tenantId);
        log.debug("Tenant context set: tenantId={}, path={}", tenantId, httpRequest.getRequestURI());

        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String extractFromSubdomain(HttpServletRequest request) {
        String host = request.getServerName();
        if (host != null && host.contains(".")) {
            String subdomain = host.split("\\.")[0];
            if (!"localhost".equals(subdomain) && !"www".equals(subdomain)) {
                return subdomain;
            }
        }
        return DEFAULT_TENANT;
    }
}
