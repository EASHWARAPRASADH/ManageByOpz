package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionSkillRepository extends JpaRepository<RequisitionSkill, UUID> {
    List<RequisitionSkill> findByRequisitionIdAndTenantIdAndDeletedFalse(UUID requisitionId, String tenantId);
    List<RequisitionSkill> findByRequisitionIdAndTenantId(UUID requisitionId, String tenantId);
    void deleteByRequisitionIdAndTenantId(UUID requisitionId, String tenantId);
}
