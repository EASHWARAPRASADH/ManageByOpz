package com.managemyopz.security.aspect;

import com.managemyopz.security.annotation.RequiresPermission;
import com.managemyopz.security.service.SecurityPlatformService;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.managemyopz.shared.exception.PlatformException;

import java.util.Optional;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class RequiresPermissionAspect {

    private final SecurityPlatformService securityPlatformService;
    private final UserRepository userRepository;

    @Before("@annotation(requiresPermission)")
    public void checkPermission(JoinPoint joinPoint, RequiresPermission requiresPermission) {
        String permValue = requiresPermission.value();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new PlatformException("Access denied: Not authenticated", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }

        if (userOpt.isEmpty()) {
            throw new PlatformException("Access denied: User not found", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }

        User user = userOpt.get();

        // Ultra Super Admin is always allowed
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            return;
        }

        String pageCode;
        String permissionCode;
        if (permValue.contains(":")) {
            String[] parts = permValue.split(":", 2);
            pageCode = parts[0];
            permissionCode = parts[1];
        } else {
            pageCode = "DASHBOARD_PAGE";
            permissionCode = permValue;
        }

        boolean hasAccess = securityPlatformService.hasPermission(user.getId(), pageCode, permissionCode);
        if (!hasAccess) {
            log.warn("[PBAC] Access Denied: User {} does not have permission {} on page {}", username, permissionCode, pageCode);
            throw new PlatformException("Access denied: Insufficient permissions", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }
    }
}
