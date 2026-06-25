# Enterprise Business Suite — Implementation Plan
## Part 4 of 6: Shared Backend Services

---

## Overview

These four services live in `platform-*` modules. **No business module reimplements them.** They expose simple Java interfaces and REST endpoints consumed by all modules uniformly.

---

## Phase 14 — Audit Trail (`platform-audit`)

### 14.1 Goal

Every data change — who changed what, from what value, to what value, when, and from where.

### 14.2 Database Schema

```sql
CREATE TABLE AU_LOG (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    ENTITY_TYPE   VARCHAR(100)  NOT NULL,   -- e.g. "Employee", "Invoice"
    ENTITY_ID     VARCHAR(50)   NOT NULL,
    ACTION        VARCHAR(20)   NOT NULL,   -- CREATE | UPDATE | DELETE | VIEW
    OLD_VALUES    JSON,
    NEW_VALUES    JSON,
    CHANGED_BY    VARCHAR(100)  NOT NULL,
    CHANGED_AT    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IP_ADDRESS    VARCHAR(45),
    USER_AGENT    VARCHAR(500),
    REQUEST_ID    VARCHAR(100),
    MODULE        VARCHAR(50)
);
```

### 14.3 AuditService Interface

```java
// platform-audit: com.managemyopz.audit.service.AuditService
public interface AuditService {
    void log(AuditEntry entry);
}

@Builder
public class AuditEntry {
    private Long   orgId;
    private String entityType;
    private String entityId;
    private String action;          // CREATE | UPDATE | DELETE
    private Object oldValues;
    private Object newValues;
    private String changedBy;
    private String ipAddress;
    private String module;
}
```

### 14.4 Spring Event-Driven Integration

Business modules fire an event — audit module listens. Zero coupling.

```java
// Any service fires this:
applicationEventPublisher.publishEvent(
    AuditEvent.builder()
        .entityType("Employee")
        .entityId(String.valueOf(employee.getId()))
        .action("UPDATE")
        .oldValues(originalDto)
        .newValues(updatedDto)
        .build()
);

// AuditEventListener in platform-audit catches it asynchronously:
@EventListener @Async
public void onAuditEvent(AuditEvent event) {
    auditService.log(AuditEntry.from(event, TenantContext.get(), SecurityUtils.currentUser()));
}
```

### 14.5 Audit API

```
GET /api/audit/logs?entityType=Employee&entityId=42&page=0&size=20
→ Returns paginated audit history for any entity

GET /api/audit/logs?module=hr&from=2025-01-01&to=2025-12-31
→ Module-level audit report
```

---

## Phase 15 — Notification Engine (`platform-notification`)

### 15.1 Goal

One service that dispatches Email, SMS, Push, In-App, and WhatsApp notifications. No module builds its own email sender.

### 15.2 Database Schema

```sql
-- Template registry
CREATE TABLE NT_TEMPLATE (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    TEMPLATE_CODE VARCHAR(100)  NOT NULL,   -- LEAVE_APPROVED, TICKET_ASSIGNED
    CHANNEL       VARCHAR(20)   NOT NULL,   -- EMAIL | SMS | PUSH | IN_APP
    SUBJECT       VARCHAR(255),
    BODY          TEXT          NOT NULL,   -- Thymeleaf/Mustache template
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    CREATED_BY    VARCHAR(100), CREATED_DATE DATETIME
);

-- Delivery log
CREATE TABLE NT_LOG (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    TEMPLATE_CODE VARCHAR(100),
    CHANNEL       VARCHAR(20)   NOT NULL,
    RECIPIENT     VARCHAR(255)  NOT NULL,
    STATUS        VARCHAR(20)   NOT NULL,   -- SENT | FAILED | PENDING
    ERROR_MSG     TEXT,
    SENT_AT       DATETIME,
    CREATED_DATE  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- In-app notification inbox
CREATE TABLE NT_INBOX (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    USER_ID       BIGINT        NOT NULL,
    TITLE         VARCHAR(255)  NOT NULL,
    MESSAGE       TEXT          NOT NULL,
    ACTION_URL    VARCHAR(500),
    IS_READ       TINYINT(1) DEFAULT 0,
    CREATED_DATE  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 15.3 NotificationService Interface

```java
public interface NotificationService {
    void send(NotificationRequest request);
    void sendAsync(NotificationRequest request);  // fire-and-forget
}

@Builder
public class NotificationRequest {
    private Long         orgId;
    private String       templateCode;   // e.g. "LEAVE_APPROVED"
    private List<String> recipients;     // emails, phone numbers, or userIds
    private Map<String, Object> variables;  // template placeholders
    private Set<Channel> channels;       // EMAIL, SMS, IN_APP, etc.
}
```

### 15.4 Usage from any module

```java
// In LeaveService, after approval:
notificationService.sendAsync(
    NotificationRequest.builder()
        .orgId(leave.getOrgId())
        .templateCode("LEAVE_APPROVED")
        .recipients(List.of(employee.getEmail()))
        .variables(Map.of(
            "employeeName", employee.getFullName(),
            "leaveType",    leave.getLeaveType(),
            "fromDate",     leave.getFromDate(),
            "toDate",       leave.getToDate()
        ))
        .channels(Set.of(Channel.EMAIL, Channel.IN_APP))
        .build()
);
```

### 15.5 Notification API

```
GET  /api/notifications/inbox?userId={id}&page=0&size=20
GET  /api/notifications/unread-count
PUT  /api/notifications/{id}/read
PUT  /api/notifications/read-all
```

---

## Phase 16 — Workflow Engine (`platform-workflow`)

### 16.1 Goal

Replace hardcoded approval chains with a configurable, reusable engine. Any module registers a workflow definition; the engine manages state transitions.

### 16.2 Database Schema

```sql
-- Workflow definition
CREATE TABLE WF_DEFINITION (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    MODULE        VARCHAR(50)   NOT NULL,   -- HR | TK | BL
    ENTITY_TYPE   VARCHAR(100)  NOT NULL,   -- LeaveRequest | Ticket | Invoice
    NAME          VARCHAR(100)  NOT NULL,
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    VERSION       INT DEFAULT 0
);

-- Steps within a definition
CREATE TABLE WF_STEP (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    DEFINITION_ID   BIGINT        NOT NULL,
    STEP_ORDER      INT           NOT NULL,
    STEP_NAME       VARCHAR(100)  NOT NULL,
    APPROVER_TYPE   VARCHAR(50),            -- ROLE | USER | DEPARTMENT_HEAD
    APPROVER_VALUE  VARCHAR(100),           -- role code or user ID
    IS_PARALLEL     TINYINT(1) DEFAULT 0,
    TIMEOUT_HOURS   INT DEFAULT 48
);

-- Running instances
CREATE TABLE WF_INSTANCE (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID          BIGINT        NOT NULL,
    DEFINITION_ID   BIGINT        NOT NULL,
    ENTITY_TYPE     VARCHAR(100)  NOT NULL,
    ENTITY_ID       BIGINT        NOT NULL,
    CURRENT_STATUS  VARCHAR(50)   NOT NULL,   -- PENDING | APPROVED | REJECTED
    CURRENT_STEP    INT           DEFAULT 1,
    INITIATED_BY    VARCHAR(100),
    COMPLETED_AT    DATETIME,
    CREATED_DATE    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step-level actions
CREATE TABLE WF_STEP_LOG (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    INSTANCE_ID   BIGINT        NOT NULL,
    STEP_ID       BIGINT        NOT NULL,
    ACTION        VARCHAR(20)   NOT NULL,   -- APPROVED | REJECTED | DELEGATED
    ACTIONED_BY   VARCHAR(100),
    COMMENTS      TEXT,
    ACTIONED_AT   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 16.3 WorkflowService Interface

```java
public interface WorkflowService {

    // Start a new workflow for any entity
    WfInstance start(WorkflowStartRequest request);

    // Approver takes action on current step
    WfInstance action(WorkflowActionRequest request);

    // Query current state
    WfInstance getState(Long instanceId);

    // Fetch pending approvals for a user
    List<WfInstance> getPendingFor(Long userId, Long orgId);
}
```

### 16.4 Leave Approval Example

```
Configuration (stored in WF_DEFINITION + WF_STEP):
Step 1 → Approver: ROLE = MANAGER
Step 2 → Approver: ROLE = HR_MANAGER
Step 3 → AUTO_APPROVE if days ≤ 1

Runtime (WF_INSTANCE lifecycle):
Employee submits → status = PENDING (step 1)
Manager approves → status = PENDING (step 2)
HR approves      → status = APPROVED
Notification sent at each transition
```

### 16.5 Workflow API

```
POST /api/workflow/start                → initiate workflow for entity
POST /api/workflow/{instanceId}/approve → approve current step
POST /api/workflow/{instanceId}/reject  → reject with comments
GET  /api/workflow/pending              → pending approvals for current user
GET  /api/workflow/{instanceId}         → current state + history
```

---

## Phase 17 — Document / Attachment Service (`platform-shared` or dedicated module)

### 17.1 Goal

Single upload endpoint. All modules reference documents by ID — no module stores files independently.

### 17.2 Database Schema

```sql
CREATE TABLE DOC_ATTACHMENT (
    ID             BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID         BIGINT        NOT NULL,
    MODULE         VARCHAR(50)   NOT NULL,   -- HR | TK | BL | PO
    ENTITY_TYPE    VARCHAR(100)  NOT NULL,   -- Employee | Ticket | Invoice
    ENTITY_ID      BIGINT        NOT NULL,
    FILE_NAME      VARCHAR(255)  NOT NULL,
    ORIGINAL_NAME  VARCHAR(255)  NOT NULL,
    CONTENT_TYPE   VARCHAR(100)  NOT NULL,
    FILE_SIZE      BIGINT,
    STORAGE_PATH   VARCHAR(500)  NOT NULL,   -- local path or S3 key
    STORAGE_TYPE   VARCHAR(20)   DEFAULT 'LOCAL',   -- LOCAL | S3 | AZURE
    UPLOADED_BY    VARCHAR(100),
    UPLOADED_AT    DATETIME DEFAULT CURRENT_TIMESTAMP,
    IS_ACTIVE      TINYINT(1) DEFAULT 1,
    VERSION        INT DEFAULT 0
);
```

### 17.3 Storage Strategy (Pluggable)

```java
public interface StorageProvider {
    String store(MultipartFile file, String path) throws IOException;
    Resource load(String storagePath);
    void delete(String storagePath);
}

// Implementations:
//  LocalStorageProvider  → stores to server disk
//  S3StorageProvider     → stores to AWS S3
//  AzureStorageProvider  → stores to Azure Blob
// Switched via application.yml: storage.provider=local|s3|azure
```

### 17.4 Attachment API

```
POST   /api/v1/documents/upload?module=HR&entityType=Employee&entityId=42
GET    /api/v1/documents/{id}/download
GET    /api/v1/documents?module=HR&entityType=Employee&entityId=42
DELETE /api/v1/documents/{id}
```

### 17.5 Module Integration

Any module stores a file by calling:

```java
AttachmentService.upload(file, AttachmentContext.builder()
    .module("HR")
    .entityType("Employee")
    .entityId(employee.getId())
    .build());
```

And displays files by calling:
```
GET /api/v1/documents?module=HR&entityType=Employee&entityId=42
```

No module manages its own file system.

---

## Phase 17.5 — Master Data Module (`platform-master`)

To prevent redundancy, core common references are centralized here. Every business module queries this module instead of defining its own reference tables.

### 17.5.1 Master Data Models

Includes entities such as:
- **Geography**: Country, State, City.
- **Organization**: Department, Designation, Holiday, Shift, Warehouse.
- **Finance**: Currency, Tax.
- **Operational Constants**: Status, Priority, Category, Unit of Measure (UoM).

```sql
-- MD_CURRENCY
CREATE TABLE MD_CURRENCY (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    CURRENCY_CODE VARCHAR(3) NOT NULL UNIQUE, -- USD, EUR, INR
    CURRENCY_NAME VARCHAR(50) NOT NULL,
    SYMBOL        VARCHAR(10) NOT NULL,
    IS_ACTIVE     TINYINT(1) DEFAULT 1
);

-- MD_DEPARTMENT
CREATE TABLE MD_DEPARTMENT (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT NOT NULL,
    NAME          VARCHAR(100) NOT NULL,
    CODE          VARCHAR(30) NOT NULL,
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    CONSTRAINT UK_MD_DEPT_ORG UNIQUE (ORG_ID, CODE)
);
```

---

## Phase 17.6 — Configuration Module (`platform-config`)

All properties that admins need to tweak at runtime must reside in the database, avoiding hardcoded values or `.properties` changes that require re-deployments.

### 17.6.1 Configuration Schema

```sql
-- CF_SETTING
CREATE TABLE CF_SETTING (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT NOT NULL,
    CONFIG_KEY    VARCHAR(100) NOT NULL,  -- smtp.host, leave.max_carry_forward
    CONFIG_VALUE  TEXT NOT NULL,
    VALUE_TYPE    VARCHAR(20) DEFAULT 'STRING', -- STRING | INT | BOOLEAN | JSON
    IS_READONLY   TINYINT(1) DEFAULT 0,
    UPDATED_BY    VARCHAR(100), UPDATED_DATE DATETIME,
    CONSTRAINT UK_CF_SETTING_ORG_KEY UNIQUE (ORG_ID, CONFIG_KEY)
);
```

### 17.6.2 ConfigProvider usage

```java
@Component
@RequiredArgsConstructor
public class ConfigProvider {
    private final SettingRepository settingRepository;

    public String getString(String key, String defaultValue) {
        return settingRepository.findByOrgIdAndConfigKey(TenantContext.get(), key)
            .map(Setting::getConfigValue)
            .orElse(defaultValue);
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        return settingRepository.findByOrgIdAndConfigKey(TenantContext.get(), key)
            .map(s -> Boolean.parseBoolean(s.getConfigValue()))
            .orElse(defaultValue);
    }
}
```

---

## Phase 17.7 — Centralised Scheduler (`platform-scheduler`)

A single scheduling module (using Spring Scheduler or Quartz Cluster) triggers periodic background tasks, tracking failures and logs in a single registry.

### 17.7.1 Scheduler Registry

```sql
-- SC_JOB
CREATE TABLE SC_JOB (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT NOT NULL,
    JOB_NAME      VARCHAR(100) NOT NULL,
    CRON_EXPRESSION VARCHAR(50) NOT NULL,
    IS_ENABLED    TINYINT(1) DEFAULT 1,
    LAST_RUN      DATETIME,
    STATUS        VARCHAR(20), -- SUCCESS | FAILED
    CREATED_BY    VARCHAR(100), CREATED_DATE DATETIME
);
```

---

## Phase 17.8 — Global Search Engine Framework (`platform-search`)

Provide a standardized lookup capability. Instead of every module implementing search independently, the `platform-search` framework aggregates indexes.

### 17.8.1 Registry Strategy

When modules publish domain events (e.g., `EMPLOYEE_CREATED` or `TICKET_CREATED`), the Search Engine catches the event and indexes the entity into a central table (`SR_INDEX`) or a dedicated Elastic/OpenSearch backend:

```sql
CREATE TABLE SR_INDEX (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT NOT NULL,
    MODULE        VARCHAR(50) NOT NULL,    -- HR | TK | BL | CR
    ENTITY_TYPE   VARCHAR(100) NOT NULL,   -- Employee | Ticket | Invoice
    ENTITY_ID     BIGINT NOT NULL,
    SEARCH_TEXT   TEXT NOT NULL,           -- Concatenated text for full-text lookup
    PRIMARY_LABEL VARCHAR(255) NOT NULL,   -- Name / Title to display in results
    DETAIL_URL    VARCHAR(500) NOT NULL,   -- UI route: /hr/employees/42
    FULLTEXT(SEARCH_TEXT)
);
```

```
GET /api/v1/search?query=John   → scans SR_INDEX and returns matching items with their detail URLs
```

---

## Shared Services Integration Map

```
          ┌──────────────────────────────────────────┐
          │           Business Module                │
          │  (HRMS / Ticketing / Billing / etc.)     │
          └────┬──────────┬──────────┬───────────────┘
               │          │          │
       publishEvent    call       call
               │          │          │
     ┌─────────▼──┐  ┌────▼────┐  ┌─▼────────────┐
     │  platform  │  │platform │  │   platform   │
     │   -audit   │  │-workflow│  │-notification │
     └────────────┘  └─────────┘  └──────────────┘
                                         │
                                  ┌──────▼──────┐
                                  │  platform   │
                                  │  (storage)  │
                                  └─────────────┘
```

---

## What's Next

**Part 5** → Module Expansion Playbook, Business Rules Engine & Integration Layer
