package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.ApprovalMatrixLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ApprovalMatrixLevelRepository extends JpaRepository<ApprovalMatrixLevel, UUID> {
}
