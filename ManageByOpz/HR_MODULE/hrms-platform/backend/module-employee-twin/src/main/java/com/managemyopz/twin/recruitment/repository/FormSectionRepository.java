package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.FormSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormSectionRepository extends JpaRepository<FormSection, UUID> {
    List<FormSection> findByTenantIdAndFormIdAndDeletedFalseOrderByDisplayOrderAsc(String tenantId, UUID formId);
    Optional<FormSection> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
