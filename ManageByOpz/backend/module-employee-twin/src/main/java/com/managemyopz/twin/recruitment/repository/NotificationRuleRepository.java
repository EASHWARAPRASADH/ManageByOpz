package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRuleRepository extends JpaRepository<NotificationRule, UUID> {
    List<NotificationRule> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<NotificationRule> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<NotificationRule> findByTenantIdAndEventTypeAndActiveTrueAndDeletedFalse(String tenantId, String eventType);
}
