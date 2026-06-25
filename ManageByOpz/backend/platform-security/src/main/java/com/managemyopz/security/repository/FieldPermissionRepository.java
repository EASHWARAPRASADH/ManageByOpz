package com.managemyopz.security.repository;

import com.managemyopz.security.entity.FieldPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface FieldPermissionRepository extends JpaRepository<FieldPermission, UUID> {
    List<FieldPermission> findByRoleId(UUID roleId);
    List<FieldPermission> findByUserId(UUID userId);
}
