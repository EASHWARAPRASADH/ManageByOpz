# Enterprise Business Suite — Implementation Plan
## Part 1 of 6: Foundation, Standards & Architecture

> **Context:** You already have `ManageMyTalenthive` (HRMS) built with React + Vite + TypeScript (frontend) and Spring Boot multi-module Maven (backend). This plan treats that as **Module 1** and evolves it into a full Enterprise Suite called **ManageByOpz**.

> **Architecture Decision — Modular Monolith:** All business modules (HRMS, Ticketing, Billing, Inventory, CRM) are deployed as **one Spring Boot application** initially. Each module is independently structured inside the codebase but shares a single deployment unit. If a specific module (e.g. Ticketing) needs independent scaling in the future, it can be extracted into its own service without changing the overall architecture or UI. This avoids premature operational complexity.

---

## Current State Audit

| Layer | What Exists | Gap |
|---|---|---|
| Backend | `platform-shared`, `platform-security`, `platform-audit`, `platform-workflow`, `platform-notification`, `module-employee-twin`, `module-leave`, `module-recognition` | No formal API standard, no global exception handler documented |
| Frontend | `features/` with auth, dashboard, employees, leave, org-dna, recruitment, security, workflow | No shared component library, no design token system |
| Database | MySQL with Flyway migrations | No enforced table prefix standard across future modules |
| Infra | `infrastructure/` directory exists | No Docker Compose, no CI/CD pipeline yet |

---

## Phase 1 — Enterprise Development Standard

> **Deliverable:** `docs/ENTERPRISE_STANDARD_v1.md` — the rulebook every developer follows.

### 1.1 Folder Structure Standard

```
managememyopz-enterprise/
├── docs/
│   ├── ENTERPRISE_STANDARD_v1.md  # The developer rulebook
│   ├── adr/                       # Architecture Decision Records
│   │   ├── ADR-001-modular-monolith.md
│   │   ├── ADR-002-jwt-auth.md
│   │   ├── ADR-003-flyway.md
│   │   ├── ADR-004-mysql.md
│   │   └── ADR-005-react-typescript.md
│   └── api/                       # OpenAPI specs per module
├── backend/
│   ├── platform-core/             # Auth, RBAC, Menu, Audit, Workflow, Notification
│   │                              # Config, Files, Reports, Search, Scheduler
│   ├── platform-shared/           # BaseEntity, ApiResponse, DTOs, Events (exists)
│   ├── platform-master/           # Master Data: Country, Currency, Dept, Tax, UoM
│   ├── platform-config/           # System config: SMTP, SMS, Theme, Business Hours
│   ├── platform-scheduler/        # Centralised scheduled jobs (Quartz)
│   ├── platform-integration/      # Connectors: Email, SMS, Payment, LDAP, Webhooks
│   ├── platform-license/          # Module enable/disable, user limits, subscription
│   ├── module-hrms/               # HRMS (merge existing modules)
│   ├── module-ticketing/
│   ├── module-billing/
│   ├── module-inventory/
│   ├── module-crm/
│   └── app-bootstrap/             # Single Spring Boot entry point (exists)
├── frontend/
│   ├── src/
│   │   ├── design-system/         # Tokens, base CSS, theme
│   │   ├── components/            # Shared component library
│   │   ├── platform/              # Layout, router, store, auth
│   │   ├── features/              # One folder per module
│   │   └── utils/
└── infrastructure/
    ├── docker/
    ├── nginx/
    └── ci/
```

### 1.2 Naming Convention Standard

**Backend (Java)**

| Artifact | Pattern | Example |
|---|---|---|
| Entity | `PascalCase` | `Employee`, `LeaveRequest` |
| Controller | `{Domain}Controller` | `EmployeeController` |
| Service Interface | `{Domain}Service` | `EmployeeService` |
| Service Impl | `{Domain}ServiceImpl` | `EmployeeServiceImpl` |
| Repository | `{Domain}Repository` | `EmployeeRepository` |
| Request DTO | `{Domain}Request` | `EmployeeRequest` |
| Response DTO | `{Domain}Response` | `EmployeeResponse` |
| Mapper | `{Domain}Mapper` | `EmployeeMapper` |
| Exception | `{Domain}Exception` | `EmployeeNotFoundException` |

**Frontend (TypeScript)**

| Artifact | Pattern | Example |
|---|---|---|
| Component | `PascalCase.tsx` | `EmployeeTable.tsx` |
| Page/Screen | `{Domain}Screen.tsx` | `EmployeeScreen.tsx` |
| API slice | `{domain}Api.ts` | `employeeApi.ts` |
| Hook | `use{Domain}.ts` | `useEmployee.ts` |
| Types | `{domain}.types.ts` | `employee.types.ts` |
| Store slice | `{domain}Slice.ts` | `employeeSlice.ts` |

**Database**

| Module | Prefix | Example Tables |
|---|---|---|
| Administration | `AD_` | `AD_USER`, `AD_ROLE`, `AD_PERMISSION`, `AD_MENU` |
| Master Data | `MD_` | `MD_COUNTRY`, `MD_CURRENCY`, `MD_TAX`, `MD_UOM` |
| Configuration | `CF_` | `CF_SETTING`, `CF_TEMPLATE`, `CF_POLICY` |
| Scheduler | `SC_` | `SC_JOB`, `SC_JOB_LOG`, `SC_TRIGGER` |
| Integration | `IG_` | `IG_CONNECTOR`, `IG_WEBHOOK`, `IG_LOG` |
| License | `LC_` | `LC_PLAN`, `LC_SUBSCRIPTION`, `LC_FEATURE_FLAG` |
| HRMS | `HR_` | `HR_EMPLOYEE`, `HR_ATTENDANCE`, `HR_LEAVE` |
| Ticketing | `TK_` | `TK_TICKET`, `TK_STATUS`, `TK_SLA` |
| Billing | `BL_` | `BL_INVOICE`, `BL_PAYMENT`, `BL_TAX` |
| Inventory | `IN_` | `IN_PRODUCT`, `IN_STOCK`, `IN_MOVEMENT` |
| CRM | `CR_` | `CR_CONTACT`, `CR_LEAD`, `CR_DEAL` |
| Procurement | `PO_` | `PO_ORDER`, `PO_VENDOR`, `PO_ITEM` |
| Workflow | `WF_` | `WF_PROCESS`, `WF_STEP`, `WF_INSTANCE` |
| Audit | `AU_` | `AU_LOG`, `AU_CHANGE` |
| Notification | `NT_` | `NT_TEMPLATE`, `NT_LOG` |

### 1.2b Database Constraint Naming Standard

All indexes, foreign keys, and unique constraints must follow a predictable naming pattern:

| Constraint | Pattern | Example |
|---|---|---|
| Primary Key | `PK_{TABLE}` | `PK_HR_EMPLOYEE` |
| Foreign Key | `FK_{TABLE}_{REFERENCED}` | `FK_HR_EMPLOYEE_DEPARTMENT` |
| Unique | `UK_{TABLE}_{COLUMN}` | `UK_AD_USER_EMAIL` |
| Index | `IDX_{TABLE}_{COLUMN}` | `IDX_TK_TICKET_STATUS` |
| Composite Index | `IDX_{TABLE}_{COL1}_{COL2}` | `IDX_HR_LEAVE_EMP_DATE` |

**ID Generation Strategy:** Use `BIGINT AUTO_INCREMENT` for all tables. Do not use UUID as primary key (poor index performance in MySQL). Use a separate `UUID` column where external reference is needed.

**Soft Delete Strategy:** Never `DELETE` rows. Set `IS_ACTIVE = 0`. All queries must include `WHERE IS_ACTIVE = 1` (enforced by Hibernate filter alongside tenant filter).

**Audit Strategy:** All entity changes trigger an `AuditEvent` (Spring Application Event). The audit module persists old/new values to `AU_LOG` asynchronously.

### 1.3 Database Column Standard

Every table — no exceptions — must have:

```sql
ID            BIGINT        PRIMARY KEY AUTO_INCREMENT,
ORG_ID        BIGINT        NOT NULL,   -- multi-tenant isolation
CREATED_BY    VARCHAR(100)  NOT NULL,
CREATED_DATE  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
UPDATED_BY    VARCHAR(100),
UPDATED_DATE  DATETIME      ON UPDATE CURRENT_TIMESTAMP,
IS_ACTIVE     TINYINT(1)    NOT NULL DEFAULT 1,
VERSION       INT           NOT NULL DEFAULT 0  -- optimistic locking
```

Map to a `BaseEntity` in `platform-shared`:

```java
// platform-shared: com.managemyopz.shared.entity.BaseEntity
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orgId;

    @CreatedBy   private String createdBy;
    @CreatedDate private LocalDateTime createdDate;
    @LastModifiedBy  private String updatedBy;
    @LastModifiedDate private LocalDateTime updatedDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Version private Integer version;
}
```

---

## Phase 2 — Enterprise Architecture Blueprint

### 2.1 Backend Layer Architecture

```
HTTP Request
    │
    ▼
[Spring Security Filter] → JWT Validation → RBAC Check
    │
    ▼
[Controller]           → @Valid on Request DTO
    │
    ▼
[Service Interface]    → Business logic + transaction boundary
    │
    ▼
[Validator]            → Domain-specific rules (beyond @Valid)
    │
    ▼
[Mapper]               → MapStruct Entity ↔ DTO conversion
    │
    ▼
[Repository]           → Spring Data JPA + custom @Query
    │
    ▼
[Database]             → MySQL with Flyway-managed schema
```

**Rule:** Never skip layers. Controller never calls Repository directly. Service never builds HTTP responses.

### 2.2 Standard API Response Envelope

Define once in `platform-shared`, use everywhere:

```java
// com.managemyopz.shared.dto.ApiResponse<T>
@Data @Builder
public class ApiResponse<T> {
    private boolean success;
    private String  message;
    private T       data;
    private Object  errors;
    private String  timestamp;
    private String  requestId;   // UUID for tracing

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
            .success(true).message(message).data(data)
            .timestamp(Instant.now().toString())
            .build();
    }

    public static <T> ApiResponse<T> error(String message, Object errors) {
        return ApiResponse.<T>builder()
            .success(false).message(message).errors(errors)
            .timestamp(Instant.now().toString())
            .build();
    }
}
```

### 2.3 API URL Standard

All APIs are versioned. Never expose unversioned endpoints.

```
GET    /api/v1/{module}/{resource}          → list (paginated)
GET    /api/v1/{module}/{resource}/{id}     → get one
POST   /api/v1/{module}/{resource}          → create
PUT    /api/v1/{module}/{resource}/{id}     → full update
PATCH  /api/v1/{module}/{resource}/{id}     → partial update
DELETE /api/v1/{module}/{resource}/{id}     → soft delete (set is_active=false)

Examples:
GET    /api/v1/hr/employees?page=0&size=20
POST   /api/v1/hr/employees
GET    /api/v1/tk/tickets/{id}
PATCH  /api/v1/bl/invoices/{id}/status
```

**Versioning Rule:** When a breaking change is needed, introduce `/api/v2/` for the affected endpoint. The old version stays live until all consumers are migrated. Version the controller class:

```java
@RestController
@RequestMapping("/api/v1/hr/employees")
public class EmployeeController { ... }
```

### 2.4 Paginated Response Standard

```java
// Wrap Spring Page into standard envelope
public static <T> ApiResponse<PageResponse<T>> paged(Page<T> page, String message) {
    PageResponse<T> pr = PageResponse.<T>builder()
        .content(page.getContent())
        .page(page.getNumber())
        .size(page.getSize())
        .totalElements(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .last(page.isLast())
        .build();
    return ok(pr, message);
}
```

---

## Phase 3 — Global Exception Handling

Single `GlobalExceptionHandler` in `platform-shared`. No try-catch-return-string anywhere.

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid"
            ));
        log.warn("Validation failed for {}: {}", req.getRequestURI(), fieldErrors);
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Validation failed", fieldErrors));
    }

    // Entity not found
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage(), null));
    }

    // Access denied
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleForbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("Access denied", null));
    }

    // Catch-all
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleAll(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("An unexpected error occurred", null));
    }
}
```

---

## Phase 4 — Logging Standard

### 4.1 Structured Request/Response Logging Filter

```java
@Component @Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        long start = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);

        try {
            chain.doFilter(req, res);
        } finally {
            long duration = System.currentTimeMillis() - start;
            log.info("METHOD={} URI={} STATUS={} DURATION={}ms USER={} IP={}",
                req.getMethod(), req.getRequestURI(),
                res.getStatus(), duration,
                getCurrentUser(), req.getRemoteAddr());
            MDC.clear();
        }
    }
}
```

**Rules:**
- Use `SLF4J` only — never `System.out.println`
- Use `MDC` to attach `requestId`, `userId`, `orgId` to every log line
- Log levels: `ERROR` for exceptions, `WARN` for business rule violations, `INFO` for lifecycle events, `DEBUG` for dev-time details

---

## Phase 5 — Domain Events (Loose Module Coupling)

Modules must **never call each other directly**. Instead, publish Spring Application Events. This keeps modules decoupled so any module can be extracted later.

```java
// Generic domain event — published by any module
@Builder
public class DomainEvent {
    private String eventType;    // EMPLOYEE_CREATED, TICKET_ASSIGNED, INVOICE_PAID
    private String module;       // HR | TK | BL
    private Long   entityId;
    private Long   orgId;
    private String triggeredBy;
    private Object payload;      // The full entity snapshot
    private Instant occurredAt;
}
```

**Example: Employee Created**
```java
// EmployeeServiceImpl publishes:
applicationEventPublisher.publishEvent(
    DomainEvent.builder()
        .eventType("EMPLOYEE_CREATED")
        .module("HR")
        .entityId(employee.getId())
        .orgId(employee.getOrgId())
        .payload(employeeResponse)
        .triggeredBy(SecurityUtils.currentUser())
        .occurredAt(Instant.now())
        .build()
);

// platform-audit listens → writes to AU_LOG
// platform-notification listens → sends welcome email
// platform-search listens → indexes employee record
// platform-core analytics listens → increments headcount
```

**Rule:** One publisher, many listeners. A new cross-cutting concern is added by adding a listener — not by modifying the publisher.

---

## Phase 6 — Architecture Decision Records (ADR)

Every significant technical decision must be documented. Create a file per decision in `docs/adr/`.

**ADR Template:**

```markdown
# ADR-001: Modular Monolith over Microservices

## Status
Accepted

## Context
The platform is in early stage with one development team. Microservices introduce
operational overhead (service discovery, distributed tracing, inter-service auth)
that slows development at this stage.

## Decision
Deploy all modules as one Spring Boot application. Each module is independently
packaged inside the codebase (separate Maven module, own package, own DB prefix).

## Consequences
- Simpler deployment and debugging
- Shared JVM — one module crash affects all (mitigated by exception handling)
- Future extraction to microservices is possible since modules are already isolated
```

**Required ADRs before first release:**

| ADR | Decision |
|---|---|
| ADR-001 | Modular Monolith |
| ADR-002 | JWT + HttpOnly Cookie refresh |
| ADR-003 | Flyway for DB migrations |
| ADR-004 | MySQL (vs PostgreSQL) |
| ADR-005 | React + TypeScript (strict) |
| ADR-006 | RTK Query for API state |
| ADR-007 | MapStruct for DTO mapping |
| ADR-008 | Spring Events for module communication |

---

## What's Next

| Part | Topic |
|---|---|
| **Part 2** | Security, JWT, RBAC, Multi-Tenancy + Feature Flags + License |
| **Part 3** | Frontend Design System, Component Library, TypeScript strict |
| **Part 4** | Platform Core Services: Audit, Notification, Workflow, Documents, Master Data, Config, Scheduler, Search |
| **Part 5** | Module Expansion Playbook + Business Rules Engine + Integration Layer |
| **Part 6** | Infrastructure, CI/CD, Testing, Reporting & Monitoring |
