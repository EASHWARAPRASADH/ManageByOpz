package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.HolidayCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HolidayCalendarRepository extends JpaRepository<HolidayCalendar, UUID> {
    List<HolidayCalendar> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<HolidayCalendar> findByIdAndDeletedFalse(UUID id);
    List<HolidayCalendar> findByTenantIdAndOrganizationIdAndYearAndDeletedFalse(String tenantId, UUID organizationId, int year);
    List<HolidayCalendar> findByTenantIdAndYearAndDeletedFalse(String tenantId, int year);
}
