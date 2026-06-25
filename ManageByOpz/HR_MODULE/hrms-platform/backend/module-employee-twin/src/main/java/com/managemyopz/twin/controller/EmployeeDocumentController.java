package com.managemyopz.twin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.twin.entity.EmployeeDocument;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeDocumentRepository;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/v1/employees/{employeeId}/documents")
@RequiredArgsConstructor
public class EmployeeDocumentController {

    private final EmployeeTwinRepository twinRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ApiResponse<List<EmployeeDocument>> getActiveDocuments(@PathVariable UUID employeeId) {
        List<EmployeeDocument> allDocs = documentRepository.findAllByEmployeeId(employeeId);
        
        // Group by documentType and find the one with maximum versionNumber
        Collection<EmployeeDocument> latestDocs = allDocs.stream()
                .collect(Collectors.toMap(
                        EmployeeDocument::getDocumentType,
                        d -> d,
                        (d1, d2) -> d1.getVersionNumber() > d2.getVersionNumber() ? d1 : d2
                ))
                .values();

        return ApiResponse.success(new ArrayList<>(latestDocs));
    }

    @GetMapping("/{docType}/history")
    public ApiResponse<List<EmployeeDocument>> getDocumentHistory(@PathVariable UUID employeeId, @PathVariable String docType) {
        List<EmployeeDocument> history = documentRepository.findAllByEmployeeIdAndType(employeeId, docType);
        history.sort((d1, d2) -> Integer.compare(d2.getVersionNumber(), d1.getVersionNumber()));
        return ApiResponse.success(history);
    }

    @PostMapping
    public ApiResponse<EmployeeDocument> uploadDocument(
            @PathVariable UUID employeeId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "documentName", required = false) String documentName,
            @RequestParam(value = "expiryDate", required = false) String expiryDateStr,
            Principal principal) {

        EmployeeTwin twin = twinRepository.findById(employeeId)
                .orElseThrow(() -> new PlatformException("Employee not found", HttpStatus.NOT_FOUND, "EMPLOYEE_NOT_FOUND"));

        String actor = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        // Find existing versions to compute next version number
        List<EmployeeDocument> existing = documentRepository.findAllByEmployeeIdAndType(employeeId, documentType);
        int nextVersion = existing.stream()
                .mapToInt(EmployeeDocument::getVersionNumber)
                .max()
                .orElse(0) + 1;

        String fileName = documentName;
        long fileSize = 0;
        String mimeType = "application/octet-stream";

        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename();
            fileSize = file.getSize();
            mimeType = file.getContentType();
        } else if (fileName == null || fileName.trim().isEmpty()) {
            fileName = "document_" + documentType.toLowerCase() + "_v" + nextVersion + ".pdf";
            fileSize = 1024 * 1024; // Mock size
            mimeType = "application/pdf";
        }

        EmployeeDocument doc = new EmployeeDocument();
        doc.setEmployeeTwin(twin);
        doc.setDocumentType(documentType);
        doc.setDocumentName(fileName);
        doc.setFileSize(fileSize);
        doc.setMimeType(mimeType);
        doc.setVersionNumber(nextVersion);
        doc.setVerificationStatus(EmployeeDocument.VerificationStatus.PENDING);
        doc.setTenantId(tenantId);
        doc.setCreatedBy(actor);

        if (expiryDateStr != null && !expiryDateStr.trim().isEmpty()) {
            try {
                doc.setExpiryDate(LocalDate.parse(expiryDateStr));
            } catch (Exception e) {
                log.warn("Invalid expiry date format: {}", expiryDateStr);
            }
        }

        // Mock saving path
        doc.setFilePath("vault/" + tenantId + "/" + employeeId + "/" + documentType + "/v" + nextVersion + "/" + fileName);

        EmployeeDocument saved = documentRepository.save(doc);

        // Record Audit Entry
        AuditAction action = nextVersion == 1 ? AuditAction.CREATE : AuditAction.UPDATE;
        recordAuditLog(tenantId, employeeId, saved, action, null, saved, actor);

        return ApiResponse.success(saved, nextVersion == 1 ? "Document uploaded successfully" : "Document replaced successfully with new version " + nextVersion);
    }

    @PostMapping("/{documentId}/restore")
    public ApiResponse<EmployeeDocument> restoreDocumentVersion(
            @PathVariable UUID employeeId,
            @PathVariable UUID documentId,
            Principal principal) {

        EmployeeDocument targetDoc = documentRepository.findById(documentId)
                .orElseThrow(() -> new PlatformException("Document version not found", HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND"));

        if (!targetDoc.getEmployeeTwin().getId().equals(employeeId)) {
            throw new PlatformException("Document does not belong to this employee", HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_OWNER");
        }

        String actor = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        // Find existing versions of this document type to compute next version number
        List<EmployeeDocument> existing = documentRepository.findAllByEmployeeIdAndType(employeeId, targetDoc.getDocumentType());
        int nextVersion = existing.stream()
                .mapToInt(EmployeeDocument::getVersionNumber)
                .max()
                .orElse(0) + 1;

        EmployeeDocument restored = new EmployeeDocument();
        restored.setEmployeeTwin(targetDoc.getEmployeeTwin());
        restored.setDocumentType(targetDoc.getDocumentType());
        restored.setDocumentName(targetDoc.getDocumentName());
        restored.setFileSize(targetDoc.getFileSize());
        restored.setMimeType(targetDoc.getMimeType());
        restored.setVersionNumber(nextVersion);
        restored.setVerificationStatus(EmployeeDocument.VerificationStatus.VERIFIED); // Mark restored version verified or match target
        restored.setExpiryDate(targetDoc.getExpiryDate());
        restored.setTenantId(tenantId);
        restored.setCreatedBy(actor);
        restored.setFilePath(targetDoc.getFilePath()); // Point to same file resource path or clone it

        EmployeeDocument saved = documentRepository.save(restored);

        // Record Audit Entry
        recordAuditLog(tenantId, employeeId, saved, AuditAction.UPDATE, targetDoc, saved, actor);

        return ApiResponse.success(saved, "Document version restored successfully as version " + nextVersion);
    }

    private void recordAuditLog(String tenantId, UUID employeeId, EmployeeDocument doc, AuditAction action, Object before, Object after, String actor) {
        try {
            Map<String, Object> beforeMap = before != null ? objectMapper.convertValue(before, Map.class) : null;
            Map<String, Object> afterMap = after != null ? objectMapper.convertValue(after, Map.class) : null;

            auditService.recordAudit(
                    tenantId,
                    "EMPLOYEE_TWIN",
                    "EmployeeDocument",
                    doc.getId().toString(),
                    action,
                    beforeMap,
                    afterMap,
                    UUID.randomUUID().toString(),
                    actor,
                    "ADMIN"
            );
        } catch (Exception e) {
            log.error("Failed to record audit log for document operation", e);
        }
    }
}
