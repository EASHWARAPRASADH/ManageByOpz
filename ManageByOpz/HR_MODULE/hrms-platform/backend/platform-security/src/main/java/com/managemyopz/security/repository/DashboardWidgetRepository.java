package com.managemyopz.security.repository;

import com.managemyopz.security.entity.DashboardWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, String> {
    Optional<DashboardWidget> findByWidgetKey(String widgetKey);
}
