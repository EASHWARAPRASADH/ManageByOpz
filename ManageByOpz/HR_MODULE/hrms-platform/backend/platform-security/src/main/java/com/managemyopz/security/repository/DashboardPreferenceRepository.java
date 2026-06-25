package com.managemyopz.security.repository;

import com.managemyopz.security.entity.DashboardPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardPreferenceRepository extends JpaRepository<DashboardPreference, UUID> {
    List<DashboardPreference> findByLayoutId(UUID layoutId);
}
