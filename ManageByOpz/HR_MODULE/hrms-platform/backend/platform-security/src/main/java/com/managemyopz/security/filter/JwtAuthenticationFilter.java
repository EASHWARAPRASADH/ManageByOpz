package com.managemyopz.security.filter;

import com.managemyopz.security.service.JwtService;
import com.managemyopz.shared.entity.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Also support parameter for convenience in testing
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isBlank()) {
                authHeader = "Bearer " + tokenParam;
            } else {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String jwt = authHeader.substring(7);
        try {
            if (jwtService.isTokenValid(jwt)) {
                String username = jwtService.extractUsername(jwt);
                String tenantId = jwtService.extractTenantId(jwt);
                String role = jwtService.extractRole(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Force set TenantContext from JWT (overriding header if needed for security)
                    if (tenantId != null && !tenantId.isBlank()) {
                        TenantContext.setCurrentTenant(tenantId);
                    }
                    TenantContext.setCurrentUser(username);
                    TenantContext.setCurrentRole(role);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            role != null ? List.of(new SimpleGrantedAuthority(role)) : List.of()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Authenticated user {} with role {} on tenant {}", username, role, tenantId);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
