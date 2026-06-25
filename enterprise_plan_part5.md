# Enterprise Business Suite — Implementation Plan
## Part 5 of 6: Module Expansion Playbook

---

## Overview

With the platform foundation in place (Parts 1–4), adding any new module follows the same repeatable playbook. This section defines that playbook and applies it to the next four priority modules: **Ticketing, Billing, Inventory, CRM**.

---

## The Module Creation Checklist

Every new module follows these steps in order. No exceptions.

```
[ ] 1. Add table prefix to naming standard doc
[ ] 2. Create Flyway migration(s) with prefixed table names + BaseEntity columns
[ ] 3. Create Maven module (e.g. module-ticketing) in backend/
[ ] 4. Add dependency on platform-shared in pom.xml
[ ] 5. Create package structure (entity, dto, repository, service, controller, mapper)
[ ] 6. Implement entities extending BaseEntity
[ ] 7. Implement Repository interfaces
[ ] 8. Implement Service interface + ServiceImpl
[ ] 9. Implement MapStruct Mapper
[ ] 10. Implement Controller with @PreAuthorize on every endpoint
[ ] 11. Register module permissions in AD_PERMISSION (Flyway migration)
[ ] 12. Register module menu in AD_MENU (Flyway migration)
[ ] 13. Create frontend feature folder under src/features/{module}/
[ ] 14. Create RTK Query API slice ({module}Api.ts)
[ ] 15. Create TypeScript types ({module}.types.ts)
[ ] 16. Create Screen components using shared component library only
[ ] 17. Register routes in router.tsx
[ ] 18. Write JUnit tests for Service layer
[ ] 19. Write integration test for Controller layer
[ ] 20. Update OpenAPI/Swagger tags with module name
```

---

## Backend Package Structure (Every Module)

```
com.managemyopz.{module}/
├── entity/
│   └── {Domain}.java                   ← extends BaseEntity
├── dto/
│   ├── {Domain}Request.java            ← @Valid annotations
│   └── {Domain}Response.java
├── repository/
│   └── {Domain}Repository.java         ← JpaRepository<{Domain}, Long>
├── service/
│   ├── {Domain}Service.java            ← interface
│   └── {Domain}ServiceImpl.java        ← @Service @Transactional
├── mapper/
│   └── {Domain}Mapper.java             ← @Mapper(componentModel = "spring")
├── controller/
│   └── {Domain}Controller.java         ← @RestController @RequestMapping
└── exception/
    └── {Domain}NotFoundException.java
```

---

## Module 2 — Ticketing

### DB Schema

```sql
-- TK_TICKET
CREATE TABLE TK_TICKET (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT        NOT NULL,
    TICKET_NO     VARCHAR(30)   NOT NULL UNIQUE,   -- TK-2025-00001
    TITLE         VARCHAR(300)  NOT NULL,
    DESCRIPTION   TEXT,
    STATUS        VARCHAR(30)   NOT NULL DEFAULT 'OPEN',
    PRIORITY      VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    CATEGORY_ID   BIGINT,
    ASSIGNED_TO   BIGINT,                          -- FK → AD_USER
    REPORTED_BY   BIGINT        NOT NULL,
    DUE_DATE      DATE,
    RESOLVED_AT   DATETIME,
    CREATED_BY    VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY    VARCHAR(100), UPDATED_DATE DATETIME,
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    VERSION       INT DEFAULT 0
);

-- TK_CATEGORY
CREATE TABLE TK_CATEGORY (
    ID         BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID     BIGINT       NOT NULL,
    NAME       VARCHAR(100) NOT NULL,
    SLA_HOURS  INT,
    IS_ACTIVE  TINYINT(1) DEFAULT 1
);

-- TK_COMMENT
CREATE TABLE TK_COMMENT (
    ID         BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID     BIGINT  NOT NULL,
    TICKET_ID  BIGINT  NOT NULL,
    COMMENT    TEXT    NOT NULL,
    IS_INTERNAL TINYINT(1) DEFAULT 0,
    CREATED_BY VARCHAR(100), CREATED_DATE DATETIME
);

-- TK_SLA_BREACH (auto-populated by a scheduler)
CREATE TABLE TK_SLA_BREACH (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT  NOT NULL,
    TICKET_ID     BIGINT  NOT NULL,
    BREACH_TYPE   VARCHAR(30),   -- RESPONSE | RESOLUTION
    BREACHED_AT   DATETIME,
    NOTIFIED      TINYINT(1) DEFAULT 0
);
```

### Status Flow (Workflow Engine)

```
OPEN → ASSIGNED → IN_PROGRESS → PENDING_CUSTOMER → RESOLVED → CLOSED
              ↘                                              ↙
               REJECTED (if invalid ticket)
```

Managed by `platform-workflow` — no status logic in `TicketService`.

### Permissions to Register

```sql
INSERT INTO AD_PERMISSION (PERMISSION_CODE, MODULE, RESOURCE, ACTION) VALUES
('tk:ticket:read',    'TICKETING', 'ticket', 'read'),
('tk:ticket:create',  'TICKETING', 'ticket', 'create'),
('tk:ticket:update',  'TICKETING', 'ticket', 'update'),
('tk:ticket:delete',  'TICKETING', 'ticket', 'delete'),
('tk:ticket:assign',  'TICKETING', 'ticket', 'assign'),
('tk:ticket:close',   'TICKETING', 'ticket', 'close'),
('tk:report:read',    'TICKETING', 'report', 'read');
```

---

## Module 3 — Billing

### DB Schema

```sql
-- BL_INVOICE
CREATE TABLE BL_INVOICE (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID          BIGINT        NOT NULL,
    INVOICE_NO      VARCHAR(30)   NOT NULL UNIQUE,
    CUSTOMER_ID     BIGINT        NOT NULL,
    STATUS          VARCHAR(30)   DEFAULT 'DRAFT',
    ISSUE_DATE      DATE,
    DUE_DATE        DATE,
    SUBTOTAL        DECIMAL(15,2),
    TAX_AMOUNT      DECIMAL(15,2),
    DISCOUNT        DECIMAL(15,2),
    TOTAL_AMOUNT    DECIMAL(15,2),
    CURRENCY_CODE   VARCHAR(3)    DEFAULT 'USD',
    NOTES           TEXT,
    CREATED_BY      VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY      VARCHAR(100), UPDATED_DATE DATETIME,
    IS_ACTIVE       TINYINT(1) DEFAULT 1,
    VERSION         INT DEFAULT 0
);

-- BL_INVOICE_ITEM
CREATE TABLE BL_INVOICE_ITEM (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    INVOICE_ID    BIGINT        NOT NULL,
    DESCRIPTION   VARCHAR(500),
    QUANTITY      DECIMAL(10,3),
    UNIT_PRICE    DECIMAL(15,2),
    TAX_RATE      DECIMAL(5,2),
    LINE_TOTAL    DECIMAL(15,2)
);

-- BL_PAYMENT
CREATE TABLE BL_PAYMENT (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID          BIGINT        NOT NULL,
    INVOICE_ID      BIGINT        NOT NULL,
    PAYMENT_DATE    DATE          NOT NULL,
    AMOUNT          DECIMAL(15,2) NOT NULL,
    METHOD          VARCHAR(30),   -- CASH | BANK_TRANSFER | CARD | UPI
    REFERENCE_NO    VARCHAR(100),
    NOTES           TEXT,
    CREATED_BY      VARCHAR(100), CREATED_DATE DATETIME,
    IS_ACTIVE       TINYINT(1) DEFAULT 1
);
```

### Invoice Status Flow (Workflow Engine)

```
DRAFT → SENT → PARTIALLY_PAID → PAID → CLOSED
      ↘                               ↗
       CANCELLED
```

---

## Module 4 — Inventory

### DB Schema

```sql
-- IN_PRODUCT
CREATE TABLE IN_PRODUCT (
    ID             BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID         BIGINT        NOT NULL,
    SKU            VARCHAR(100)  NOT NULL UNIQUE,
    NAME           VARCHAR(300)  NOT NULL,
    CATEGORY_ID    BIGINT,
    UOM            VARCHAR(20),          -- Unit of Measure: PCS, KG, LTR
    REORDER_LEVEL  INT DEFAULT 0,
    SELLING_PRICE  DECIMAL(15,2),
    COST_PRICE     DECIMAL(15,2),
    IS_ACTIVE      TINYINT(1) DEFAULT 1,
    CREATED_BY     VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY     VARCHAR(100), UPDATED_DATE DATETIME,
    VERSION        INT DEFAULT 0
);

-- IN_STOCK (current stock per warehouse)
CREATE TABLE IN_STOCK (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT  NOT NULL,
    PRODUCT_ID    BIGINT  NOT NULL,
    WAREHOUSE_ID  BIGINT  NOT NULL,
    QUANTITY      DECIMAL(15,3) DEFAULT 0,
    LAST_UPDATED  DATETIME
);

-- IN_MOVEMENT (every stock change is an immutable record)
CREATE TABLE IN_MOVEMENT (
    ID              BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID          BIGINT        NOT NULL,
    PRODUCT_ID      BIGINT        NOT NULL,
    WAREHOUSE_ID    BIGINT        NOT NULL,
    MOVEMENT_TYPE   VARCHAR(20)   NOT NULL,  -- IN | OUT | TRANSFER | ADJUSTMENT
    QUANTITY        DECIMAL(15,3) NOT NULL,
    REFERENCE_TYPE  VARCHAR(50),             -- PurchaseOrder | SalesOrder
    REFERENCE_ID    BIGINT,
    NOTES           TEXT,
    CREATED_BY      VARCHAR(100), CREATED_DATE DATETIME
);
```

### Key Business Rules

- Stock is always derived from `IN_MOVEMENT` sum (append-only ledger).
- `IN_STOCK` is a materialised cache, updated by triggers or scheduled job.
- Negative stock is blocked at service layer — not database.
- Low-stock alert fires when `QUANTITY < REORDER_LEVEL` via Notification Engine.

---

## Module 5 — CRM

### DB Schema

```sql
-- CR_CONTACT
CREATE TABLE CR_CONTACT (
    ID           BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID       BIGINT       NOT NULL,
    FIRST_NAME   VARCHAR(100) NOT NULL,
    LAST_NAME    VARCHAR(100),
    EMAIL        VARCHAR(255),
    PHONE        VARCHAR(20),
    COMPANY_NAME VARCHAR(200),
    ASSIGNED_TO  BIGINT,
    CREATED_BY   VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY   VARCHAR(100), UPDATED_DATE DATETIME,
    IS_ACTIVE    TINYINT(1) DEFAULT 1,
    VERSION      INT DEFAULT 0
);

-- CR_LEAD
CREATE TABLE CR_LEAD (
    ID           BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID       BIGINT       NOT NULL,
    CONTACT_ID   BIGINT,
    TITLE        VARCHAR(255) NOT NULL,
    STATUS       VARCHAR(30)  DEFAULT 'NEW',
    SOURCE       VARCHAR(50),
    ESTIMATED_VALUE DECIMAL(15,2),
    PROBABILITY  INT,         -- 0-100%
    EXPECTED_CLOSE DATE,
    ASSIGNED_TO  BIGINT,
    CREATED_BY   VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY   VARCHAR(100), UPDATED_DATE DATETIME,
    IS_ACTIVE    TINYINT(1) DEFAULT 1
);

-- CR_ACTIVITY (calls, meetings, emails logged against a lead/contact)
CREATE TABLE CR_ACTIVITY (
    ID           BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID       BIGINT       NOT NULL,
    LEAD_ID      BIGINT,
    CONTACT_ID   BIGINT,
    ACTIVITY_TYPE VARCHAR(30) NOT NULL,   -- CALL | EMAIL | MEETING | NOTE
    SUBJECT      VARCHAR(255),
    NOTES        TEXT,
    ACTIVITY_DATE DATETIME,
    CREATED_BY   VARCHAR(100), CREATED_DATE DATETIME
);
```

### Lead Pipeline (Workflow Engine)

```
NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON
                                                      ↘ LOST
```

## Phase 5.5 — Business Rules Engine (`platform-rules`)

To prevent hardcoding business logic (like leave thresholds, ticket escalations, tax calculations, invoice discounts), we introduce a database-driven Rules Engine. 

### 5.5.1 Rules Schema

```sql
-- RU_RULE
CREATE TABLE RU_RULE (
    ID            BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID        BIGINT NOT NULL,
    RULE_NAME     VARCHAR(100) NOT NULL,
    MODULE        VARCHAR(50) NOT NULL,    -- HRMS | BILLING | TICKETING
    CONDITION_EXPR VARCHAR(500) NOT NULL,  -- e.g. "leaveDays > 10" or "invoiceTotal > 5000"
    ACTION_EXPR    VARCHAR(500) NOT NULL,  -- e.g. "requireApproval('VP')" or "applyDiscount(0.10)"
    IS_ACTIVE     TINYINT(1) DEFAULT 1,
    CREATED_BY    VARCHAR(100), CREATED_DATE DATETIME,
    UPDATED_BY    VARCHAR(100), UPDATED_DATE DATETIME,
    VERSION       INT DEFAULT 0
);
```

### 5.5.2 Rule Evaluator (SpEL)
Use Spring Expression Language (SpEL) to dynamically parse constraints:

```java
@Service
public class RuleEvaluator {
    public boolean evaluateCondition(String expression, Map<String, Object> context) {
        ExpressionParser parser = new SpelExpressionParser();
        StandardEvaluationContext evalContext = new StandardEvaluationContext();
        evalContext.setVariables(context);
        return Boolean.TRUE.equals(parser.parseExpression(expression).getValue(evalContext, Boolean.class));
    }
}
```

---

## Phase 5.6 — Integration Module (`platform-integration`)

Centralize all outer connections. Instead of every module implementing its own S3, SMTP, SMS, Active Directory/LDAP connections, they call this unified hub.

### 5.6.1 Schema & Adapters

```sql
-- IG_INTEGRATION_CONFIG
CREATE TABLE IG_INTEGRATION_CONFIG (
    ID             BIGINT PRIMARY KEY AUTO_INCREMENT,
    ORG_ID         BIGINT NOT NULL,
    PROVIDER_TYPE  VARCHAR(50) NOT NULL,  -- SMTP | TWILIO_SMS | MS_O365 | LDAP | STRIPE
    CONFIG_JSON    TEXT NOT NULL,          -- Encrypted JSON holding keys, hostnames, certs
    IS_ACTIVE      TINYINT(1) DEFAULT 1,
    CREATED_BY     VARCHAR(100), CREATED_DATE DATETIME
);
```

Each provider implements a standard adapter interface (e.g. `SmsAdapter`, `MailAdapter`, `IdentityAdapter`), resolving the config dynamically based on the current tenant.

---

## Frontend Feature Folder (Same for Every Module)

```
src/features/{module}/
├── {module}.types.ts           ← TypeScript interfaces (Strict, no 'any')
├── {module}Api.ts              ← RTK Query slice (pointing to versioned /api/v1/ endpoints)
├── components/
│   ├── {Domain}Table.tsx
│   ├── {Domain}Form.tsx
│   └── {Domain}Card.tsx
├── screens/
│   └── {Domain}Screen.tsx
└── index.ts                    ← barrel export
```

---

## Module Priority Roadmap

| Phase | Module | Depends On |
|---|---|---|
| ✅ Phase 0 | HRMS (existing) | platform foundation |
| 🔜 Phase 1 | Ticketing | platform-workflow, platform-notification, platform-rules |
| 🔜 Phase 2 | Billing | platform-workflow, platform-notification, Inventory (optional) |
| 🔜 Phase 3 | Inventory | platform-notification, platform-rules |
| 🔜 Phase 4 | CRM | Billing, platform-workflow |
| 🔜 Phase 5 | Procurement | Inventory, Billing |
| 🔜 Phase 6 | Payroll | HRMS, platform-rules |
| 🔜 Phase 7 | Project Management | HRMS, Billing |

---

## What's Next

**Part 6** → Infrastructure, CI/CD, Testing, Reporting & Monitoring
