package com.managemyopz.audit.aspect;

import com.managemyopz.audit.annotation.Auditable;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "system";
        String role = auth != null && !auth.getAuthorities().isEmpty() 
                ? auth.getAuthorities().iterator().next().getAuthority() 
                : "SYSTEM";

        Object result = joinPoint.proceed();

        try {
            String entityId = "UNKNOWN";
            Object[] args = joinPoint.getArgs();
            for (Object arg : args) {
                if (arg instanceof UUID) {
                    entityId = arg.toString();
                    break;
                }
            }
            
            if (result != null) {
                try {
                    java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                    Object idObj = getIdMethod.invoke(result);
                    if (idObj != null) {
                        entityId = idObj.toString();
                    }
                } catch (Exception ignored) {
                }
            }

            auditService.recordAudit(
                    tenantId,
                    auditable.module(),
                    auditable.entityType(),
                    entityId,
                    auditable.action(),
                    null,
                    result,
                    UUID.randomUUID().toString(),
                    username,
                    role
            );
        } catch (Exception e) {
            log.error("Failed to record audit in aspect", e);
        }

        return result;
    }
}
