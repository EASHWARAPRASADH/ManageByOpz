package com.managemyopz.twin.service;

import com.managemyopz.twin.entity.Document;
import com.managemyopz.twin.entity.DocumentVersion;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DocumentService {
    Document createDocument(String entityType, UUID entityId, String category, MultipartFile file, String comments, String username, String tenantId);
    Document getDocument(UUID id);
    List<DocumentVersion> getDocumentVersions(UUID documentId);
    DocumentVersion replaceDocument(UUID documentId, MultipartFile file, String comments, String username, String tenantId);
    void deleteDocument(UUID id, String username);
    List<Document> getActiveDocumentsForEntity(String entityType, UUID entityId);
}
