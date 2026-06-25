# Enterprise Business Suite — Implementation Plan
## Part 6 of 6: Infrastructure, CI/CD, Testing, Reporting & Monitoring

---

## Phase 18 — Local Development Infrastructure (Docker)

### 18.1 `docker-compose.yml` (Dev Environment)

```yaml
version: '3.9'
services:

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: managemyopz
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    # Used for: session cache, rate limiting, notification queues

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI for viewing emails in dev

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    # Used as local S3-compatible storage

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/managemyopz
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      JWT_SECRET: ${JWT_SECRET}
      STORAGE_PROVIDER: minio
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mysql_data:
  minio_data:
```

### 18.2 Nginx Reverse Proxy (Production)

```nginx
# infrastructure/nginx/nginx.conf
upstream backend  { server backend:8080; }
upstream frontend { server frontend:80; }

server {
    listen 80;
    server_name app.managemyopz.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name app.managemyopz.com;

    ssl_certificate     /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (for future real-time features)
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Phase 19 — CI/CD Pipeline (GitHub Actions)

### 19.1 Backend Pipeline

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: managemyopz_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Run Tests
        run: mvn clean verify -pl backend -am
        env:
          SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/managemyopz_test
          SPRING_DATASOURCE_USERNAME: root
          SPRING_DATASOURCE_PASSWORD: root

      - name: Build Docker Image
        if: github.ref == 'refs/heads/main'
        run: docker build -t managemyopz/backend:${{ github.sha }} ./backend

      - name: Push to Registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push managemyopz/backend:${{ github.sha }}
```

### 19.2 Frontend Pipeline

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - run: npm ci
        working-directory: frontend

      - run: npm run build
        working-directory: frontend

      - name: Build Docker Image
        if: github.ref == 'refs/heads/main'
        run: docker build -t managemyopz/frontend:${{ github.sha }} ./frontend
```

---

## Phase 20 — Testing Strategy

### 20.1 Test Pyramid

```
          /\
         /  \   E2E Tests (Playwright) — happy path only
        /────\
       /      \  Integration Tests (Testcontainers) — controller layer
      /────────\
     /          \  Unit Tests (JUnit 5 + Mockito) — service layer (majority)
    /────────────\
```

### 20.2 Service Unit Test Pattern

```java
@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @InjectMocks EmployeeServiceImpl employeeService;
    @Mock        EmployeeRepository  employeeRepository;
    @Mock        EmployeeMapper      employeeMapper;
    @Mock        AuditService        auditService;

    @Test
    @DisplayName("Should create employee and return response DTO")
    void createEmployee_success() {
        // Arrange
        EmployeeRequest request = buildRequest();
        Employee entity = buildEntity();
        EmployeeResponse expected = buildResponse();

        when(employeeMapper.toEntity(request)).thenReturn(entity);
        when(employeeRepository.save(entity)).thenReturn(entity);
        when(employeeMapper.toResponse(entity)).thenReturn(expected);

        // Act
        EmployeeResponse result = employeeService.create(request);

        // Assert
        assertThat(result.getEmployeeCode()).isEqualTo(expected.getEmployeeCode());
        verify(auditService).log(any(AuditEntry.class));
    }
}
```

### 20.3 Integration Test Pattern (Testcontainers)

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class EmployeeControllerIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("managemyopz_test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",      mysql::getJdbcUrl);
        r.add("spring.datasource.username", mysql::getUsername);
        r.add("spring.datasource.password", mysql::getPas    @Test
    void createEmployee_returns201() {
        EmployeeRequest body = buildRequest();
        ResponseEntity<ApiResponse> resp =
            restTemplate.postForEntity("/api/v1/hr/employees", body, ApiResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}

### 20.4 Test Coverage Targets

| Layer | Target |
|---|---|
| Service (unit) | ≥ 80% line coverage |
| Controller (integration) | 100% endpoint coverage |
| Repository | Covered by integration tests |
| Frontend components | Key interactions via Vitest |

---

## Phase 21 — Flyway Migration Discipline

### Rules

1. Migration files are **never edited** after merge to `main`.
2. Naming: `V{version}__{description}.sql` → `V20250101_001__create_ad_user.sql`
3. Each module owns its own migration resource path:
   ```
   module-hrms/src/main/resources/db/migration/hr/
   module-ticketing/src/main/resources/db/migration/tk/
   ```
4. `app-bootstrap` aggregates all locations:
   ```yaml
   spring.flyway.locations:
     - classpath:db/migration/platform
     - classpath:db/migration/hr
     - classpath:db/migration/tk
     - classpath:db/migration/bl
   ```

---

## Phase 22 — Reporting Engine

Every module must support PDF, Excel, and CSV export from the same data source.

### 22.1 Backend Report Service

```java
// platform-shared or dedicated platform-reporting module
public interface ReportService {
    byte[] generatePdf(ReportDefinition def);
    byte[] generateExcel(ReportDefinition def);
    String generateCsv(ReportDefinition def);
}

// Libraries:
// PDF   → iText / OpenPDF
// Excel → Apache POI (SXSSF for streaming large sets)
// CSV   → Apache Commons CSV
```

### 22.2 Standard Report Endpoint Pattern

```
GET /api/v1/hr/employees/export?format=pdf&...filters
GET /api/v1/hr/employees/export?format=excel
GET /api/v1/hr/employees/export?format=csv
GET /api/v1/tk/tickets/export?format=pdf&status=OPEN
```

Response: `Content-Disposition: attachment; filename="employees-2025-01-01.pdf"`

### 22.3 Frontend Download Trigger

```ts
const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
  const res = await fetch(`/api/v1/hr/employees/export?format=${format}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `employees.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Phase 23 — OpenAPI / Swagger Documentation

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI enterpriseOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("ManageByOpz Enterprise API")
                .version("1.0.0")
                .description("Unified API documentation for all enterprise modules"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
            .components(new Components()
                .addSecuritySchemes("Bearer Auth",
                    new SecurityScheme()
                        .type(HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}

// On every Controller:
@Tag(name = "Employee Management", description = "HRMS Employee CRUD operations")
@Operation(summary = "List employees", description = "Returns paginated employee list for the authenticated org")
```

Access at: `http://localhost:8080/swagger-ui.html`

---

## Phase 24 — Monitoring Stack

### 24.1 Spring Boot → Prometheus → Grafana

```yaml
# application.yml
management:
  endpoints.web.exposure.include: health, info, metrics, prometheus
  metrics.export.prometheus.enabled: true
```

```yaml
# infrastructure/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'managemyopz-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']
```

### 24.2 Custom Business Metrics

```java
// Track key business events with Micrometer
@Autowired MeterRegistry meterRegistry;

// Count ticket creations
meterRegistry.counter("tickets.created", "orgId", orgId.toString()).increment();

// Gauge active sessions
Gauge.builder("sessions.active", sessionRepository, r -> r.countActiveSessions())
     .register(meterRegistry);
```

### 24.3 Grafana Dashboards to Create

| Dashboard | Key Metrics |
|---|---|
| Platform Health | JVM heap, GC pauses, thread pool, DB pool |
| API Performance | p50/p95/p99 latency per endpoint, error rate |
| Business KPIs | Tickets/day, Invoices created, Employees onboarded |
| Security | Failed logins/hour, locked accounts, active sessions |

---

## Full Enterprise Launch Order Summary

To build a robust platform without premature abstraction, follow this 3-Level Roadmap structure:

### Level 1: Platform Core (Weeks 1-10)
- **Weeks 1–2**: Phase 1: Naming & DB standard, BaseEntity, GlobalExceptionHandler, Logging MDC, compile first ADRs.
- **Weeks 3–4**: Phase 2: JWT Access+Refresh flows, Spring Security, Multi-tenant Hibernate filters, Password Policies.
- **Weeks 5–6**: Phase 3: Frontend CSS Tokens, Component Library scaffolding, Router/Sidebar with strict typing.
- **Weeks 7–8**: Phase 4: Shared Core Services (Audit logging, Workflow Engine config, Notification templates, Attachments service).
- **Weeks 9–10**: Phase 4.5: Master Data setup (Geography, Currency, Depts), Config provider database mappings, Quartz Schedulers, Global Search index.

### Level 2: Business Modules (Weeks 11-18)
- **Weeks 11–12**: Phase 5: Scaffold & scaffold verification of **Ticketing** module + integration with Rules engine.
- **Weeks 13–14**: Phase 5: **Billing** module + PDF/Excel export reports.
- **Weeks 15–16**: Phase 5: **Inventory** module (ledger movement strategy).
- **Weeks 17–18**: Phase 5: **CRM** module pipeline & activities.

### Level 3: Platform Services (Weeks 19-24)
- **Weeks 19–20**: Phase 5.6: Integration Adapters hub (Stripe, Microsoft Office 365, LDAP, Webhooks).
- **Weeks 21–22**: Phase 9.5: License Manager & Feature Flags (subscription management aspect).
- **Weeks 23–24**: Phase 24: Devops infrastructure deployment, Prometheus telemetry, and test coverage audit.

---

## Complete Plan Index

| File | Contents |
|---|---|
| [Part 1](enterprise_plan_part1.md) | Foundation, Standards, Architecture, Exceptions, Logging, Domain Events, ADRs |
| [Part 2](enterprise_plan_part2.md) | Security, JWT, RBAC, Multi-Tenancy, License Management, Feature Flags |
| [Part 3](enterprise_plan_part3.md) | Frontend Design System & Component Library, Strict TypeScript |
| [Part 4](enterprise_plan_part4.md) | Audit, Notification, Workflow, Document, Master Data, Config, Scheduler, Search |
| [Part 5](enterprise_plan_part5.md) | Module Expansion Playbook, Business Rules Engine & Integration Layer |
| [Part 6](enterprise_plan_part6.md) | Infrastructure, CI/CD, Testing, Reporting, Monitoring ← You are here |
