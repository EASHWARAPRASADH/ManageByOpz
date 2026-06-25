package com.managemyopz.twin.controller;

import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.service.EmployeeExportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * EmployeeExportController — REST endpoints for Employee Directory exports.
 *
 * GET /v1/employees/export/csv
 * GET /v1/employees/export/excel
 * GET /v1/employees/export/pdf
 */
@Slf4j
@RestController
@RequestMapping("/v1/employees/export")
@RequiredArgsConstructor
public class EmployeeExportController {

    private final EmployeeExportService exportService;
    private final AuditService auditService;

    private static final DateTimeFormatter FILENAME_DATE = DateTimeFormatter.ofPattern("yyyy_MM_dd");

    // ── CSV ──────────────────────────────────────────

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) List<UUID> ids,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employmentTypeId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "false") boolean showArchived,
            HttpServletRequest request) throws IOException {

        long start = System.currentTimeMillis();
        String user = getCurrentUser();
        log.info("Export Requested — Format: CSV, User: {}, Filters: search={}, status={}, dept={}, loc={}",
                user, search, status, departmentId, locationId);

        List<EmployeeTwin> employees = exportService.getFilteredEmployees(
                ids, search, status, locationId, departmentId, employmentTypeId, sortBy, showArchived);

        byte[] data = exportService.exportCsv(employees);
        String filename = "employees_" + LocalDate.now().format(FILENAME_DATE) + ".csv";
        long duration = System.currentTimeMillis() - start;

        log.info("Export Complete — Format: CSV, Rows: {}, Filename: {}, Size: {} bytes, Time: {} ms",
                employees.size(), filename, data.length, duration);

        auditExport("CSV", employees.size(), buildFilterMap(search, status, locationId, departmentId), user, request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(data.length)
                .body(data);
    }

    // ── Excel ──────────────────────────────────────────

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) List<UUID> ids,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employmentTypeId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "false") boolean showArchived,
            HttpServletRequest request) throws IOException {

        long start = System.currentTimeMillis();
        String user = getCurrentUser();
        log.info("Export Requested — Format: EXCEL, User: {}, Filters: search={}, status={}, dept={}, loc={}",
                user, search, status, departmentId, locationId);

        List<EmployeeTwin> employees = exportService.getFilteredEmployees(
                ids, search, status, locationId, departmentId, employmentTypeId, sortBy, showArchived);

        byte[] data = exportService.exportExcel(employees, "Acme Corp");
        String filename = "employees_" + LocalDate.now().format(FILENAME_DATE) + ".xlsx";
        long duration = System.currentTimeMillis() - start;

        log.info("Export Complete — Format: EXCEL, Rows: {}, Filename: {}, Size: {} bytes, Time: {} ms",
                employees.size(), filename, data.length, duration);

        auditExport("EXCEL", employees.size(), buildFilterMap(search, status, locationId, departmentId), user, request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(data.length)
                .body(data);
    }

    // ── PDF ──────────────────────────────────────────

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) List<UUID> ids,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employmentTypeId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "false") boolean showArchived,
            HttpServletRequest request) {

        long start = System.currentTimeMillis();
        String user = getCurrentUser();
        log.info("Export Requested — Format: PDF, User: {}, Filters: search={}, status={}, dept={}, loc={}",
                user, search, status, departmentId, locationId);

        List<EmployeeTwin> employees = exportService.getFilteredEmployees(
                ids, search, status, locationId, departmentId, employmentTypeId, sortBy, showArchived);

        byte[] data = exportService.exportPdf(employees, "Acme Corp", user);
        String filename = "employees_" + LocalDate.now().format(FILENAME_DATE) + ".pdf";
        long duration = System.currentTimeMillis() - start;

        log.info("Export Complete — Format: PDF, Rows: {}, Filename: {}, Size: {} bytes, Time: {} ms",
                employees.size(), filename, data.length, duration);

        auditExport("PDF", employees.size(), buildFilterMap(search, status, locationId, departmentId), user, request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(data.length)
                .body(data);
    }

    // ── Helpers ──────────────────────────────────────────

    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }

    private Map<String, Object> buildFilterMap(String search, String status, UUID locationId, UUID departmentId) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (search != null) map.put("search", search);
        if (status != null) map.put("status", status);
        if (locationId != null) map.put("locationId", locationId.toString());
        if (departmentId != null) map.put("departmentId", departmentId.toString());
        return map;
    }

    private void auditExport(String type, int count, Map<String, Object> filters, String user, HttpServletRequest request) {
        try {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("exportType", type);
            details.put("recordsExported", count);
            details.put("appliedFilters", filters);
            details.put("ipAddress", request.getRemoteAddr());

            auditService.recordAudit(
                TenantContext.getCurrentTenant(),
                "module-employee-twin",
                "EMPLOYEE_TWIN",
                "EXPORT",
                AuditLog.AuditAction.EXPORT,
                null,
                details,
                UUID.randomUUID().toString(),
                user,
                "SYSTEM"
            );
        } catch (Exception e) {
            log.warn("Audit logging failed for export: {}", e.getMessage());
        }
    }
}
