package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionCustomField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionCustomFieldRepository extends JpaRepository<RequisitionCustomField, UUID> {
    List<RequisitionCustomField> findByTenantIdAndDeletedFalseOrderByDisplayOrderAsc(String tenantId);
}
