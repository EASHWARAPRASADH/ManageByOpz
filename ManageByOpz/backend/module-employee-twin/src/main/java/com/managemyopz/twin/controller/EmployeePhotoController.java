package com.managemyopz.twin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.twin.entity.EmployeePhoto;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeePhotoRepository;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.Principal;
import java.time.Instant;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/v1/employees/{employeeId}/photo")
@RequiredArgsConstructor
public class EmployeePhotoController {

    private final EmployeeTwinRepository twinRepository;
    private final EmployeePhotoRepository photoRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    private static final String UPLOAD_DIR = "uploads/photos/";

    @GetMapping
    public ApiResponse<EmployeePhoto> getPhotoMetadata(@PathVariable UUID employeeId) {
        EmployeePhoto photo = photoRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new PlatformException("Photo not found", HttpStatus.NOT_FOUND, "PHOTO_NOT_FOUND"));
        return ApiResponse.success(photo);
    }

    @GetMapping("/raw")
    public ResponseEntity<byte[]> getRawPhoto(@PathVariable UUID employeeId) throws IOException {
        EmployeePhoto photo = photoRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new PlatformException("Photo not found", HttpStatus.NOT_FOUND, "PHOTO_NOT_FOUND"));
        
        File file = new File(photo.getStoragePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = Files.readAllBytes(file.toPath());
        MediaType mediaType = MediaType.parseMediaType(photo.getMimeType());
        
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(bytes);
    }

    @PostMapping
    public ApiResponse<EmployeePhoto> uploadPhoto(
            @PathVariable UUID employeeId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        
        validatePhoto(file);

        EmployeeTwin twin = twinRepository.findById(employeeId)
                .orElseThrow(() -> new PlatformException("Employee not found", HttpStatus.NOT_FOUND, "EMPLOYEE_NOT_FOUND"));

        String actor = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        // Check if photo already exists
        Optional<EmployeePhoto> existingOpt = photoRepository.findByEmployeeId(employeeId);
        if (existingOpt.isPresent()) {
            throw new PlatformException("Photo already exists. Use PUT to replace it.", HttpStatus.BAD_REQUEST, "PHOTO_ALREADY_EXISTS");
        }

        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + ext;
        String checksum = DigestUtils.md5DigestAsHex(file.getBytes());
        long fileSize = file.getSize();
        String mimeType = file.getContentType();

        File dir = new File(UPLOAD_DIR + employeeId);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File dest = new File(dir, fileName);
        file.transferTo(dest);

        EmployeePhoto photo = new EmployeePhoto();
        photo.setEmployeeTwin(twin);
        photo.setFileName(fileName);
        photo.setOriginalName(originalName);
        photo.setMimeType(mimeType);
        photo.setFileSize(fileSize);
        photo.setUploadedBy(actor);
        photo.setUploadedAt(Instant.now());
        photo.setChecksum(checksum);
        photo.setStoragePath(dest.getAbsolutePath());
        photo.setThumbnailPath("/api/v1/employees/" + employeeId + "/photo/raw");
        photo.setTenantId(tenantId);
        photo.setCreatedBy(actor);

        EmployeePhoto saved = photoRepository.save(photo);

        twin.setAvatarUrl("/api/v1/employees/" + employeeId + "/photo/raw");
        twinRepository.save(twin);

        recordAuditLog(tenantId, employeeId, saved, AuditAction.CREATE, null, saved, actor);

        return ApiResponse.success(saved, "Photo uploaded successfully");
    }

    @PutMapping
    public ApiResponse<EmployeePhoto> replacePhoto(
            @PathVariable UUID employeeId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        
        validatePhoto(file);

        EmployeeTwin twin = twinRepository.findById(employeeId)
                .orElseThrow(() -> new PlatformException("Employee not found", HttpStatus.NOT_FOUND, "EMPLOYEE_NOT_FOUND"));

        String actor = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        EmployeePhoto existing = photoRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new PlatformException("Photo not found", HttpStatus.NOT_FOUND, "PHOTO_NOT_FOUND"));

        Map<String, Object> beforeMap = objectMapper.convertValue(existing, Map.class);

        File oldFile = new File(existing.getStoragePath());
        if (oldFile.exists()) {
            oldFile.delete();
        }

        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + ext;
        String checksum = DigestUtils.md5DigestAsHex(file.getBytes());
        long fileSize = file.getSize();
        String mimeType = file.getContentType();

        File dir = new File(UPLOAD_DIR + employeeId);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File dest = new File(dir, fileName);
        file.transferTo(dest);

        existing.setFileName(fileName);
        existing.setOriginalName(originalName);
        existing.setMimeType(mimeType);
        existing.setFileSize(fileSize);
        existing.setUploadedBy(actor);
        existing.setUploadedAt(Instant.now());
        existing.setChecksum(checksum);
        existing.setStoragePath(dest.getAbsolutePath());
        existing.setUpdatedBy(actor);

        EmployeePhoto saved = photoRepository.save(existing);

        twin.setAvatarUrl("/api/v1/employees/" + employeeId + "/photo/raw");
        twinRepository.save(twin);

        recordAuditLog(tenantId, employeeId, saved, AuditAction.UPDATE, beforeMap, saved, actor);

        return ApiResponse.success(saved, "Photo replaced successfully");
    }

    @DeleteMapping
    public ApiResponse<Void> deletePhoto(@PathVariable UUID employeeId, Principal principal) {
        EmployeeTwin twin = twinRepository.findById(employeeId)
                .orElseThrow(() -> new PlatformException("Employee not found", HttpStatus.NOT_FOUND, "EMPLOYEE_NOT_FOUND"));

        String actor = principal != null ? principal.getName() : "system";
        String tenantId = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        EmployeePhoto photo = photoRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new PlatformException("Photo not found", HttpStatus.NOT_FOUND, "PHOTO_NOT_FOUND"));

        File file = new File(photo.getStoragePath());
        if (file.exists()) {
            file.delete();
        }

        photoRepository.delete(photo);

        twin.setAvatarUrl(null);
        twinRepository.save(twin);

        recordAuditLog(tenantId, employeeId, photo, AuditAction.DELETE, photo, null, actor);

        return ApiResponse.success(null, "Photo deleted successfully");
    }

    private void validatePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new PlatformException("File is empty", HttpStatus.BAD_REQUEST, "PHOTO_EMPTY");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new PlatformException("Invalid filename", HttpStatus.BAD_REQUEST, "INVALID_FILENAME");
        }
        int dotIdx = originalFilename.lastIndexOf(".");
        if (dotIdx == -1) {
            throw new PlatformException("File has no extension", HttpStatus.BAD_REQUEST, "INVALID_FILENAME");
        }
        String ext = originalFilename.substring(dotIdx + 1).toLowerCase();
        if (!List.of("jpg", "jpeg", "png", "webp").contains(ext)) {
            throw new PlatformException("Only JPG, JPEG, PNG, and WEBP formats are allowed", HttpStatus.BAD_REQUEST, "INVALID_PHOTO_FORMAT");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new PlatformException("File size must not exceed 5MB", HttpStatus.BAD_REQUEST, "PHOTO_TOO_LARGE");
        }
    }

    private void recordAuditLog(String tenantId, UUID employeeId, EmployeePhoto photo, AuditAction action, Object before, Object after, String actor) {
        try {
            Map<String, Object> beforeMap = before instanceof Map ? (Map) before : (before != null ? objectMapper.convertValue(before, Map.class) : null);
            Map<String, Object> afterMap = after != null ? objectMapper.convertValue(after, Map.class) : null;

            auditService.recordAudit(
                    tenantId,
                    "EMPLOYEE_TWIN",
                    "EmployeePhoto",
                    photo.getId() != null ? photo.getId().toString() : UUID.randomUUID().toString(),
                    action,
                    beforeMap,
                    afterMap,
                    UUID.randomUUID().toString(),
                    actor,
                    "ADMIN"
            );
        } catch (Exception e) {
            log.error("Failed to record audit log for photo operation", e);
        }
    }
}
