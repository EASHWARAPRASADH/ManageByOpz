# Enterprise Business Suite — Implementation Plan
## Part 2 of 6: Security, JWT, RBAC & Multi-Tenancy

---

## Overview

Security is **shared infrastructure** — no module manages its own users. Everything flows through `platform-security`, which already exists in your codebase. This part hardens and standardises it.

---

## Phase 7 — Authentication (JWT)

### 7.1 Token Strategy

| Token | TTL | Storage |
|---|---|---|
| Access Token | 15 minutes | Memory (JS variable / Redux) |
| Refresh Token | 7 days | HttpOnly Secure Cookie |

Never store the access token in `localStorage` — it is XSS-vulnerable.

### 7.2 JWT Payload Standard

```json
{
  "sub": "user@managemyopz.com",
  "userId": 1001,
  "orgId": 5,
  "branchId": 12,
  "roles": ["ROLE_HR_MANAGER"],
  "permissions": ["hr:employee:read", "hr:employee:write"],
  "sessionId": "uuid-v4",
  "iat": 1700000000,
  "exp": 1700000900
}
```

### 7.3 Token Flow

```
[Login Request]
      │
      ▼
AuthController.login()
      │
      ├── Validate credentials (BCrypt)
      ├── Check isActive, password expiry, account lock
      ├── Generate Access Token  (JwtService)
      ├── Generate Refresh Token (JwtService)
      ├── Persist session → AD_SESSION table
      ├── Set Refresh Token → HttpOnly Cookie
      └── Return Access Token in body

[Every Subsequent Request]
      │
      ▼
JwtAuthFilter (OncePerRequestFilter)
      │
      ├── Extract Bearer token from Authorization header
      ├── Validate signature + expiry
      ├── Extract orgId, userId, permissions
      ├── Set TenantContext (orgId)
      ├── Build SecurityContext (UsernamePasswordAuthenticationToken)
      └── Continue filter chain

[Refresh Flow]
POST /api/auth/refresh
      │
      ├── Read Refresh Token from HttpOnly Cookie
      ├── Validate against AD_SESSION
      ├── Issue new Access Token
      └── Rotate Refresh Token (replace in cookie + DB)

[Logout]
POST /api/auth/logout
      │
      ├── Invalidate session in AD_SESSION (set is_active=false)
      ├── Clear HttpOnly Cookie
      └── Return 200
```

### 7.4 Spring Security Filter Chain

```java
@Configuration @EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthFilter jwtFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(customAuthEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            )
            .build();
    }
}
```

---

## Phase 8 — RBAC (Role-Based Access Control)

### 8.1 Permission Model

```
Organization
    └── User (AD_USER)
          └── Role (AD_ROLE)           ← Many-to-Many: AD_USER_ROLE
                └── Permission (AD_PERMISSION)  ← Many-to-Many: AD_ROLE_PERMISSION
                      └── Menu (AD_MENU)        ← which sidebar items are visible
```

### 8.2 Permission Naming Convention

```
{module}:{resource}:{action}

Examples:
hr:employee:read
hr:employee:write
hr:employee:delete
hr:leave:approve
tk:ticket:read
tk:ticket:assign
bl:invoice:create
bl:invoice:approve
```

### 8.3 Database Schema

```sql
-- AD_ROLE
CREATE TABLE AD_ROLE (
    ID           BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID       BIGINT NOT NULL,
    ROLE_NAME    VARCHAR(100) NOT NULL,
    ROLE_CODE    VARCHAR(50)  NOT NULL,
    DESCRIPTION  TEXT,
    IS_SYSTEM    TINYINT(1) DEFAULT 0,  -- system roles cannot be deleted
    CREATED_BY   VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY   VARCHAR(100), UPDATED_DATE DATETIME,
    IS_ACTIVE    TINYINT(1) DEFAULT 1,
    VERSION      INT DEFAULT 0
);

-- AD_PERMISSION
CREATE TABLE AD_PERMISSION (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    PERMISSION_CODE VARCHAR(100) NOT NULL UNIQUE,  -- hr:employee:read
    MODULE          VARCHAR(50)  NOT NULL,
    RESOURCE        VARCHAR(50)  NOT NULL,
    ACTION          VARCHAR(50)  NOT NULL,
    DESCRIPTION     VARCHAR(255),
    IS_ACTIVE       TINYINT(1) DEFAULT 1
);

-- AD_ROLE_PERMISSION (join)
CREATE TABLE AD_ROLE_PERMISSION (
    ROLE_ID       BIGINT NOT NULL,
    PERMISSION_ID BIGINT NOT NULL,
    PRIMARY KEY (ROLE_ID, PERMISSION_ID)
);

-- AD_USER_ROLE (join)
CREATE TABLE AD_USER_ROLE (
    USER_ID BIGINT NOT NULL,
    ROLE_ID BIGINT NOT NULL,
    PRIMARY KEY (USER_ID, ROLE_ID)
);

-- AD_SESSION
CREATE TABLE AD_SESSION (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    USER_ID       BIGINT       NOT NULL,
    ORG_ID        BIGINT       NOT NULL,
    SESSION_ID    VARCHAR(255) NOT NULL UNIQUE,
    REFRESH_TOKEN TEXT,
    IP_ADDRESS    VARCHAR(45),
    USER_AGENT    TEXT,
    LAST_ACTIVE   DATETIME,
    EXPIRES_AT    DATETIME,
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    CREATED_DATE  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 8.4 Method-Level Security

```java
// On controller methods — declarative security
@GetMapping("/employees")
@PreAuthorize("hasAuthority('hr:employee:read')")
public ResponseEntity<ApiResponse<?>> list(...) { }

@PostMapping("/employees")
@PreAuthorize("hasAuthority('hr:employee:write')")
public ResponseEntity<ApiResponse<?>> create(...) { }

@DeleteMapping("/employees/{id}")
@PreAuthorize("hasAuthority('hr:employee:delete')")
public ResponseEntity<ApiResponse<?>> delete(...) { }
```

### 8.5 Menu Visibility API

```
GET /api/auth/menu   → returns the sidebar tree based on user permissions

Response:
{
  "data": [
    {
      "module": "HRMS",
      "icon": "users",
      "children": [
        { "label": "Employees",  "path": "/hr/employees",  "permission": "hr:employee:read" },
        { "label": "Attendance", "path": "/hr/attendance", "permission": "hr:attendance:read" },
        { "label": "Leave",      "path": "/hr/leave",      "permission": "hr:leave:read" }
      ]
    }
  ]
}
```

Frontend renders **only** what the API returns — never hardcode sidebar items.

---

## Phase 9 — Multi-Tenancy (Data Isolation)

### 9.1 TenantContext

```java
// com.managemyopz.shared.context.TenantContext
public class TenantContext {
    private static final ThreadLocal<Long> CURRENT_ORG = new ThreadLocal<>();

    public static void set(Long orgId) { CURRENT_ORG.set(orgId); }
    public static Long get() { return CURRENT_ORG.get(); }
    public static void clear() { CURRENT_ORG.remove(); }
}
```

Set in `JwtAuthFilter` after token validation:
```java
TenantContext.set(claims.get("orgId", Long.class));
```

Clear in filter's finally block:
```java
finally { TenantContext.clear(); }
```

### 9.2 Hibernate Filter for Automatic org_id Scoping

```java
// On BaseEntity
@FilterDef(name = "tenantFilter",
           parameters = @ParamDef(name = "orgId", type = Long.class))
@Filter(name = "tenantFilter", condition = "ORG_ID = :orgId")
public abstract class BaseEntity { ... }
```

```java
// In a Hibernate interceptor / AOP aspect — enable filter on every Session
@Aspect @Component
public class TenantFilterAspect {

    @PersistenceContext EntityManager em;

    @Before("execution(* com.managemyopz..repository.*.*(..))")
    public void enableTenantFilter() {
        Session session = em.unwrap(Session.class);
        session.enableFilter("tenantFilter")
               .setParameter("orgId", TenantContext.get());
    }
}
```

**Result:** Every JPA query automatically appends `AND ORG_ID = ?`. No developer needs to remember to filter by org.

### 9.3 Password Policy (AD_PASSWORD_POLICY)

```sql
CREATE TABLE AD_PASSWORD_POLICY (
    ID                BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID            BIGINT NOT NULL,
    MIN_LENGTH        INT DEFAULT 8,
    REQUIRE_UPPERCASE TINYINT(1) DEFAULT 1,
    REQUIRE_NUMBER    TINYINT(1) DEFAULT 1,
    REQUIRE_SPECIAL   TINYINT(1) DEFAULT 1,
    EXPIRY_DAYS       INT DEFAULT 90,
    MAX_FAILED_ATTEMPTS INT DEFAULT 5,
    LOCKOUT_MINUTES   INT DEFAULT 30,
    IS_ACTIVE         TINYINT(1) DEFAULT 1
);
```

### 9.4 IP Restriction (Optional, Configurable per Org)

```sql
CREATE TABLE AD_IP_WHITELIST (
    ID         BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID     BIGINT NOT NULL,
    IP_RANGE   VARCHAR(50) NOT NULL,   -- e.g. 192.168.1.0/24
    LABEL      VARCHAR(100),
    IS_ACTIVE  TINYINT(1) DEFAULT 1
);
```

Check in filter — if org has whitelist entries, reject requests from unlisted IPs with `403`.

---

## Phase 9.5 — License Management & Feature Flags (`platform-license`)

To support multi-tenancy where different clients subscribe to different packages (e.g., Company A only has HRMS and Leave, Company B has Ticketing, Inventory, and Billing), we need a centralized Feature Flag and License validation engine.

### 9.5.1 License & Feature Flag Schema

```sql
-- LC_LICENSE
CREATE TABLE LC_LICENSE (
    ID               BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID           BIGINT NOT NULL,
    LICENSE_KEY      VARCHAR(255) NOT NULL UNIQUE,
    PLAN_NAME        VARCHAR(50) NOT NULL,   -- BASIC | PROFESSIONAL | ENTERPRISE
    START_DATE       DATETIME NOT NULL,
    EXPIRY_DATE      DATETIME NOT NULL,
    MAX_USERS        INT DEFAULT 10,
    MAX_STORAGE_GB   DECIMAL(10,2) DEFAULT 5.00,
    IS_ACTIVE        TINYINT(1) DEFAULT 1,
    CREATED_BY       VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY       VARCHAR(100), UPDATED_DATE DATETIME,
    VERSION          INT DEFAULT 0,
    CONSTRAINT UK_LC_LICENSE_ORG UNIQUE (ORG_ID)
);

-- LC_FEATURE_FLAG (tracks enabled modules per tenant)
CREATE TABLE LC_FEATURE_FLAG (
    ID               BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID           BIGINT NOT NULL,
    MODULE_CODE      VARCHAR(50) NOT NULL,   -- HRMS | TICKETING | BILLING | CRM | INVENTORY
    IS_ENABLED       TINYINT(1) DEFAULT 1,
    CREATED_BY       VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY       VARCHAR(100), UPDATED_DATE DATETIME,
    VERSION          INT DEFAULT 0,
    CONSTRAINT UK_LC_FEATURE_FLAG_ORG_MOD UNIQUE (ORG_ID, MODULE_CODE)
);
```

### 9.5.2 License Guard Service

Provide an interceptor and annotation to prevent unauthorized feature or module usage:

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresModule {
    String value(); // e.g. "TICKETING"
}
```

```java
@Aspect
@Component
@RequiredArgsConstructor
public class ModuleAccessAspect {

    private final FeatureFlagService featureFlagService;

    @Before("@annotation(requiresModule) || @within(requiresModule)")
    public void verifyModuleAccess(RequiresModule requiresModule) {
        Long orgId = TenantContext.get();
        String module = requiresModule.value();
        
        if (!featureFlagService.isModuleEnabled(orgId, module)) {
            throw new AccessDeniedException("Module " + module + " is not active under your subscription plan.");
        }
    }
}
```

This prevents executing API calls for disabled features instantly. The UI should also consume this API to hide menu options dynamically (integrated with Phase 12).

---

## Security Checklist Before Going Live

- [ ] Access token in memory only (not localStorage)
- [ ] Refresh token in HttpOnly Secure cookie
- [ ] All endpoints protected by `@PreAuthorize`
- [ ] Multi-tenant Hibernate filter active on every request
- [ ] License aspect configured with `@RequiresModule` on controllers
- [ ] Password stored as BCrypt (cost factor ≥ 12)
- [ ] Account lockout after N failed attempts
- [ ] Session invalidated on logout
- [ ] Audit log entry on every login/logout
- [ ] CORS configured to allowed origins only
- [ ] HTTPS enforced in production (Nginx)

---

## What's Next

**Part 3** → Frontend Design System & Component Library (with Strict TypeScript)
