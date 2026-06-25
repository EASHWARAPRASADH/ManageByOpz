package com.managemyopz.shared.filter;

import com.managemyopz.shared.entity.TenantContext;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

/**
 * TenantAspect — Automatically enables the Hibernate tenant filter on every repository call.
 *
 * This ensures that ALL JPA queries are automatically scoped to the current tenant,
 * preventing data leakage between organizations. Works in conjunction with
 * the @FilterDef on BaseEntity.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class TenantAspect {

    private final EntityManager entityManager;

    @Before("execution(* com.managemyopz..repository..*.*(..))")
    public void enableTenantFilter(JoinPoint joinPoint) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }
    }
}
