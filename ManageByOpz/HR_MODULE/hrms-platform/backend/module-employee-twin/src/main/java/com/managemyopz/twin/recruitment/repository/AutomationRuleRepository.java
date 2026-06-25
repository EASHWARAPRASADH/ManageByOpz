package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.AutomationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, UUID> {
    List<AutomationRule> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<AutomationRule> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<AutomationRule> findByTenantIdAndTriggerEventAndActiveTrueAndDeletedFalse(String tenantId, String triggerEvent);
}
