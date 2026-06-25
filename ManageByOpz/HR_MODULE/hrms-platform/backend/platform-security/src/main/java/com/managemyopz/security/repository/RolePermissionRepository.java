package com.managemyopz.security.repository;

import com.managemyopz.security.entity.RolePermission;
import com.managemyopz.security.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
    List<RolePermission> findByRoleId(UUID roleId);
    void deleteByRoleId(UUID roleId);
}
