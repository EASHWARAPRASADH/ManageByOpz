package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository("recruitmentNotificationTemplateRepository")
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    List<NotificationTemplate> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<NotificationTemplate> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
