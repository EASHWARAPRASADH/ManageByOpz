package com.managemyopz.security.repository;

import com.managemyopz.security.entity.DataScopeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataScopeRuleRepository extends JpaRepository<DataScopeRule, UUID> {
    List<DataScopeRule> findAllByTenantId(String tenantId);
    Optional<DataScopeRule> findByRoleCodeAndTenantId(String roleCode, String tenantId);
}
