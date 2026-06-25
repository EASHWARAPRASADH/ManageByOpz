package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.AutomationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AutomationActionRepository extends JpaRepository<AutomationAction, UUID> {
    List<AutomationAction> findByTenantIdAndAutomationRuleIdAndDeletedFalse(String tenantId, UUID automationRuleId);
    Optional<AutomationAction> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
