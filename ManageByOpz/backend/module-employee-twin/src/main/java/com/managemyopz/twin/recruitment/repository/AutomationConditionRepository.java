package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.AutomationCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AutomationConditionRepository extends JpaRepository<AutomationCondition, UUID> {
    List<AutomationCondition> findByTenantIdAndAutomationRuleIdAndDeletedFalse(String tenantId, UUID automationRuleId);
    Optional<AutomationCondition> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
