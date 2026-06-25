package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.SkillMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillMasterRepository extends JpaRepository<SkillMaster, UUID> {
    List<SkillMaster> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<SkillMaster> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<SkillMaster> findByTenantIdAndSkillNameContainingIgnoreCaseAndDeletedFalse(String tenantId, String skillName);
}
