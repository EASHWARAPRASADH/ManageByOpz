package com.managemyopz.security.repository;

import com.managemyopz.security.entity.UserPermission;
import com.managemyopz.security.entity.UserPermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermission, UserPermissionId> {
    List<UserPermission> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
