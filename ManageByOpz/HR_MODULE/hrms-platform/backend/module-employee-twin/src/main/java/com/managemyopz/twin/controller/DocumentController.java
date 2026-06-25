package com.managemyopz.twin.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.Document;
import com.managemyopz.twin.entity.DocumentVersion;
import com.managemyopz.twin.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Document> uploadDocument(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("entity_type") String entityType,
            @RequestParam("entity_id") UUID entityId,
            @RequestParam("document_category") String documentCategory,
            @RequestParam(value = "comments", required = false) String comments,
            Principal principal) {
        
        String username = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        Document doc = documentService.createDocument(
                entityType, entityId, documentCategory, file, comments, username, tenantId);
        return ApiResponse.created(doc, "Document uploaded successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<Document> getDocument(@PathVariable UUID id) {
        Document doc = documentService.getDocument(id);
        return ApiResponse.success(doc);
    }

    @GetMapping("/{id}/versions")
    public ApiResponse<List<DocumentVersion>> getDocumentVersions(@PathVariable UUID id) {
        List<DocumentVersion> versions = documentService.getDocumentVersions(id);
        return ApiResponse.success(versions);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID id) {
        Document doc = documentService.getDocument(id);
        DocumentVersion version = doc.getCurrentVersion();
        if (version == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        byte[] content = ("Mock file payload. Object key: " + version.getMinioObjectKey()).getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + version.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, version.getMimeType())
                .body(content);
    }

    @PostMapping("/{id}/replace")
    public ApiResponse<DocumentVersion> replaceDocument(
            @PathVariable UUID id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "comments", required = false) String comments,
            Principal principal) {
        
        String username = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        DocumentVersion version = documentService.replaceDocument(id, file, comments, username, tenantId);
        return ApiResponse.success(version, "Document replaced successfully with version " + version.getVersionNumber());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDocument(@PathVariable UUID id, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        documentService.deleteDocument(id, username);
        return ApiResponse.success(null, "Document deleted successfully");
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ApiResponse<List<Document>> getActiveDocumentsForEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {
        List<Document> docs = documentService.getActiveDocumentsForEntity(entityType, entityId);
        return ApiResponse.success(docs);
    }
}
