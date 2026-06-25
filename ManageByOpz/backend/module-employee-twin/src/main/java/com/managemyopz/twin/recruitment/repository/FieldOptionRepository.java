package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.FieldOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldOptionRepository extends JpaRepository<FieldOption, UUID> {
    List<FieldOption> findByTenantIdAndFieldDefinitionIdAndDeletedFalseOrderByOptionOrderAsc(String tenantId, UUID fieldDefinitionId);
    Optional<FieldOption> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
