package com.managemyopz.twin.service;

import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.audit.annotation.Auditable;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import com.managemyopz.twin.entity.Document;
import com.managemyopz.twin.entity.DocumentVersion;
import com.managemyopz.twin.repository.DocumentRepository;
import com.managemyopz.twin.repository.DocumentVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    @Override
    @Transactional
    @Auditable(module = "employee-twin", action = AuditAction.CREATE, entityType = "Document")
    public Document createDocument(String entityType, UUID entityId, String category, MultipartFile file, String comments, String username, String tenantId) {
        log.info("Creating new document for entityType={}, entityId={}, category={}", entityType, entityId, category);
        
        String actualTenant = tenantId != null ? tenantId : "default";
        String actualUser = username != null ? username : "system";

        Document doc = Document.builder()
                .entityType(entityType)
                .entityId(entityId)
                .documentCategory(category)
                .status("ACTIVE")
                .build();
        doc.setTenantId(actualTenant);
        doc.setCreatedBy(actualUser);
        
        Document savedDoc = documentRepository.save(doc);

        String fileName = (file != null && !file.isEmpty()) ? file.getOriginalFilename() : "document_" + category.toLowerCase() + ".pdf";
        long fileSizeBytes = (file != null && !file.isEmpty()) ? file.getSize() : 1024 * 1024L;
        String mimeType = (file != null && !file.isEmpty()) ? file.getContentType() : "application/pdf";
        String minioKey = "vault/" + actualTenant + "/" + entityType + "/" + entityId + "/" + category + "/v1/" + fileName;
        String fileHash = calculateHash(file);

        DocumentVersion version = DocumentVersion.builder()
                .documentId(savedDoc.getId())
                .versionNumber(1)
                .fileName(fileName)
                .minioObjectKey(minioKey)
                .fileHash(fileHash)
                .fileSizeBytes(fileSizeBytes)
                .mimeType(mimeType)
                .uploadedBy(actualUser)
                .uploadedAt(Instant.now())
                .comments(comments)
                .build();

        DocumentVersion savedVersion = documentVersionRepository.save(version);

        savedDoc.setCurrentVersionId(savedVersion.getId());
        return documentRepository.save(savedDoc);
    }

    @Override
    @Transactional(readOnly = true)
    public Document getDocument(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new PlatformException("Document not found", HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentVersion> getDocumentVersions(UUID documentId) {
        return documentVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(documentId);
    }

    @Override
    @Transactional
    @Auditable(module = "employee-twin", action = AuditAction.UPDATE, entityType = "Document")
    public DocumentVersion replaceDocument(UUID documentId, MultipartFile file, String comments, String username, String tenantId) {
        Document doc = getDocument(documentId);
        String actualUser = username != null ? username : "system";
        String actualTenant = tenantId != null ? tenantId : "default";

        List<DocumentVersion> existing = documentVersionRepository.findAllByDocumentIdOrderByVersionNumberDesc(documentId);
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1;
        UUID previousVersionId = existing.isEmpty() ? null : existing.get(0).getId();

        String fileName = (file != null && !file.isEmpty()) ? file.getOriginalFilename() : "document_v" + nextVersion + ".pdf";
        long fileSizeBytes = (file != null && !file.isEmpty()) ? file.getSize() : 1024 * 1024L;
        String mimeType = (file != null && !file.isEmpty()) ? file.getContentType() : "application/pdf";
        String minioKey = "vault/" + actualTenant + "/" + doc.getEntityType() + "/" + doc.getEntityId() + "/" + doc.getDocumentCategory() + "/v" + nextVersion + "/" + fileName;
        String fileHash = calculateHash(file);

        DocumentVersion version = DocumentVersion.builder()
                .documentId(documentId)
                .versionNumber(nextVersion)
                .fileName(fileName)
                .minioObjectKey(minioKey)
                .fileHash(fileHash)
                .fileSizeBytes(fileSizeBytes)
                .mimeType(mimeType)
                .uploadedBy(actualUser)
                .uploadedAt(Instant.now())
                .comments(comments)
                .previousVersionId(previousVersionId)
                .build();

        DocumentVersion savedVersion = documentVersionRepository.save(version);

        doc.setCurrentVersionId(savedVersion.getId());
        documentRepository.save(doc);

        return savedVersion;
    }

    @Override
    @Transactional
    @Auditable(module = "employee-twin", action = AuditAction.DELETE, entityType = "Document")
    public void deleteDocument(UUID id, String username) {
        Document doc = getDocument(id);
        doc.softDelete(username);
        doc.setStatus("DELETED");
        documentRepository.save(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Document> getActiveDocumentsForEntity(String entityType, UUID entityId) {
        return documentRepository.findAllByEntityTypeAndEntityId(entityType, entityId);
    }

    private String calculateHash(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return UUID.randomUUID().toString().replace("-", "");
        }
        try {
            byte[] bytes = file.getBytes();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
