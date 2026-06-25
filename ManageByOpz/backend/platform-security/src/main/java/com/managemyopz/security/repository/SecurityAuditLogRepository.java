package com.managemyopz.security.repository;

import com.managemyopz.security.entity.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, UUID> {
    List<SecurityAuditLog> findByTargetTypeAndTargetId(String targetType, UUID targetId);
    List<SecurityAuditLog> findAllByOrderByTimestampDesc();
}
