package com.managemyopz.twin.service;

import com.managemyopz.twin.entity.*;
import com.managemyopz.twin.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataMigrationBackfiller implements ApplicationRunner {

    private final EmployeeTwinRepository twinRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        log.info("=== STARTING PHONE AND DOCUMENT MIGRATION BACKFILL ===");
        
        // 1. Backfill structured phone numbers for all Employee Twins
        List<EmployeeTwin> twins = twinRepository.findAll();
        for (EmployeeTwin twin : twins) {
            boolean updated = false;
            
            // Work Phone
            if (twin.getWorkPhone() != null && twin.getWorkPhoneFull() == null) {
                PhoneDetails parsed = parsePhone(twin.getWorkPhone());
                if (parsed != null) {
                    twin.setWorkPhoneCountryCode(parsed.countryCode);
                    twin.setWorkPhoneNumber(parsed.localNumber);
                    twin.setWorkPhoneFull(parsed.fullPhone);
                    updated = true;
                }
            }
            
            // Personal Phone
            if (twin.getPersonalPhone() != null && twin.getPersonalPhoneFull() == null) {
                PhoneDetails parsed = parsePhone(twin.getPersonalPhone());
                if (parsed != null) {
                    twin.setPersonalPhoneCountryCode(parsed.countryCode);
                    twin.setPersonalPhoneNumber(parsed.localNumber);
                    twin.setPersonalPhoneFull(parsed.fullPhone);
                    updated = true;
                }
            }
            
            if (updated) {
                twinRepository.save(twin);
                log.info("Backfilled structured phone numbers for employee twin: {}", twin.getId());
            }
        }

        // 2. Backfill Documents from legacy employee_documents
        List<EmployeeDocument> legacyDocs = employeeDocumentRepository.findAll();
        for (EmployeeDocument legacyDoc : legacyDocs) {
            UUID employeeId = legacyDoc.getEmployeeTwin().getId();
            String category = legacyDoc.getDocumentType();
            
            // Check if already migrated
            Optional<Document> existingOpt = documentRepository.findByEntityTypeAndEntityIdAndCategory(
                    "EMPLOYEE_TWIN", employeeId, category);
            
            if (existingOpt.isEmpty()) {
                String tenant = legacyDoc.getTenantId() != null ? legacyDoc.getTenantId() : "default";
                String creator = legacyDoc.getCreatedBy() != null ? legacyDoc.getCreatedBy() : "system";
                Instant uploadTime = legacyDoc.getCreatedAt() != null ? legacyDoc.getCreatedAt() : Instant.now();
                
                Document doc = Document.builder()
                        .entityType("EMPLOYEE_TWIN")
                        .entityId(employeeId)
                        .documentCategory(category)
                        .status("ACTIVE")
                        .build();
                doc.setTenantId(tenant);
                doc.setCreatedBy(creator);
                doc.setCreatedAt(uploadTime);
                
                Document savedDoc = documentRepository.save(doc);
                
                DocumentVersion version = DocumentVersion.builder()
                        .documentId(savedDoc.getId())
                        .versionNumber(legacyDoc.getVersionNumber())
                        .fileName(legacyDoc.getDocumentName() != null ? legacyDoc.getDocumentName() : "unnamed_document")
                        .minioObjectKey(legacyDoc.getFilePath() != null ? legacyDoc.getFilePath() : "unknown_path")
                        .fileHash(legacyDoc.getDigitalSignature() != null ? legacyDoc.getDigitalSignature() : "hash_" + UUID.randomUUID())
                        .fileSizeBytes(legacyDoc.getFileSize() != null ? legacyDoc.getFileSize() : 0L)
                        .mimeType(legacyDoc.getMimeType() != null ? legacyDoc.getMimeType() : "application/octet-stream")
                        .uploadedBy(creator)
                        .uploadedAt(uploadTime)
                        .comments(legacyDoc.getOcrExtractedText())
                        .build();
                
                DocumentVersion savedVersion = documentVersionRepository.save(version);
                
                savedDoc.setCurrentVersionId(savedVersion.getId());
                documentRepository.save(savedDoc);
                
                log.info("Migrated legacy document {} to new unified document: {}", legacyDoc.getId(), savedDoc.getId());
            }
        }
        
        log.info("=== PHONE AND DOCUMENT MIGRATION BACKFILL COMPLETED ===");
    }

    private static class PhoneDetails {
        final String countryCode;
        final String localNumber;
        final String fullPhone;

        PhoneDetails(String countryCode, String localNumber, String fullPhone) {
            this.countryCode = countryCode;
            this.localNumber = localNumber;
            this.fullPhone = fullPhone;
        }
    }

    private PhoneDetails parsePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        phone = phone.trim();
        String countryCode = null;
        String localNumber = null;
        if (phone.startsWith("+")) {
            int firstSpace = phone.indexOf(' ');
            if (firstSpace > 0) {
                countryCode = phone.substring(0, firstSpace);
                localNumber = phone.substring(firstSpace + 1).trim();
            } else {
                if (phone.startsWith("+971")) {
                    countryCode = "+971";
                    localNumber = phone.substring(4);
                } else if (phone.startsWith("+91")) {
                    countryCode = "+91";
                    localNumber = phone.substring(3);
                } else if (phone.startsWith("+44")) {
                    countryCode = "+44";
                    localNumber = phone.substring(3);
                } else if (phone.startsWith("+61")) {
                    countryCode = "+61";
                    localNumber = phone.substring(3);
                } else if (phone.startsWith("+65")) {
                    countryCode = "+65";
                    localNumber = phone.substring(3);
                } else if (phone.startsWith("+1")) {
                    countryCode = "+1";
                    localNumber = phone.substring(2);
                } else {
                    countryCode = "+1";
                    localNumber = phone;
                }
            }
        } else {
            countryCode = "+1";
            localNumber = phone;
        }
        
        String cleanLocal = localNumber.replaceAll("[^0-9]", "");
        String full = countryCode + cleanLocal;
        return new PhoneDetails(countryCode, cleanLocal, full);
    }
}
