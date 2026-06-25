package com.managemyopz.shared.entity;

/**
 * TenantContext — Thread-local holder for multi-tenant isolation.
 *
 * Every incoming request sets the tenant ID and current user via a servlet filter.
 * All JPA queries and entity creation automatically pick up the tenant context.
 * This is the backbone of the SaaS multi-tenant architecture.
 */
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_ROLE = new ThreadLocal<>();

    private TenantContext() {
        // Utility class
    }

    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void setCurrentTenant(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static String getCurrentUser() {
        return CURRENT_USER.get();
    }

    public static void setCurrentUser(String username) {
        CURRENT_USER.set(username);
    }

    public static String getCurrentUserId() {
        return CURRENT_USER_ID.get();
    }

    public static void setCurrentUserId(String userId) {
        CURRENT_USER_ID.set(userId);
    }

    public static String getCurrentRole() {
        return CURRENT_ROLE.get();
    }

    public static void setCurrentRole(String role) {
        CURRENT_ROLE.set(role);
    }

    /**
     * Must be called at the end of every request to prevent memory leaks.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_USER.remove();
        CURRENT_USER_ID.remove();
        CURRENT_ROLE.remove();
    }
}
