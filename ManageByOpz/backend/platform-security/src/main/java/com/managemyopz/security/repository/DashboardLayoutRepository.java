package com.managemyopz.security.repository;

import com.managemyopz.security.entity.DashboardLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DashboardLayoutRepository extends JpaRepository<DashboardLayout, UUID> {
    List<DashboardLayout> findByUserId(UUID userId);
    Optional<DashboardLayout> findByUserIdAndActiveTrue(UUID userId);
}
