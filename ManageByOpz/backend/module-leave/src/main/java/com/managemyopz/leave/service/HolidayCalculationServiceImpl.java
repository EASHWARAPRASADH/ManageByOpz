package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.HolidayCalendar;
import com.managemyopz.leave.entity.HolidayCalendarDay;
import com.managemyopz.leave.repository.HolidayCalendarDayRepository;
import com.managemyopz.leave.repository.HolidayCalendarRepository;
import com.managemyopz.orgdna.entity.Organization;
import com.managemyopz.orgdna.repository.OrganizationRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class HolidayCalculationServiceImpl implements HolidayCalculationService {

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private HolidayCalendarRepository holidayCalendarRepository;

    @Autowired
    private HolidayCalendarDayRepository holidayCalendarDayRepository;

    @Override
    public double calculateWorkingDays(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            return 0.0;
        }

        double workingDays = 0.0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (!isWeekend(employeeId, current) && !isHoliday(employeeId, current)) {
                workingDays += 1.0;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }

    @Override
    public boolean isWeekend(UUID employeeId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        EmployeeTwin employee = employeeTwinRepository.findById(employeeId).orElse(null);
        if (employee == null || employee.getOrganizationId() == null) {
            return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        }

        Organization org = organizationRepository.findById(employee.getOrganizationId()).orElse(null);
        if (org == null || org.getWeekendPolicy() == null) {
            return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        }

        String policy = org.getWeekendPolicy().trim();
        if (policy.equalsIgnoreCase("Sunday Only")) {
            return dayOfWeek == DayOfWeek.SUNDAY;
        } else if (policy.equalsIgnoreCase("Friday + Saturday")) {
            return dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;
        } else if (policy.equalsIgnoreCase("Saturday + Sunday")) {
            return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        } else {
            // Custom CSV or default back
            if (policy.toUpperCase().contains(dayOfWeek.name())) {
                return true;
            }
            return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        }
    }

    @Override
    public boolean isHoliday(UUID employeeId, LocalDate date) {
        EmployeeTwin employee = employeeTwinRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return false;
        }

        UUID orgId = employee.getOrganizationId();
        String tenantId = TenantContext.getCurrentTenant();
        int year = date.getYear();

        HolidayCalendar calendar = null;
        if (orgId != null) {
            List<HolidayCalendar> calendars = holidayCalendarRepository
                    .findByTenantIdAndOrganizationIdAndYearAndDeletedFalse(tenantId, orgId, year);
            if (!calendars.isEmpty()) {
                calendar = calendars.get(0);
            }
        }

        if (calendar == null) {
            List<HolidayCalendar> calendars = holidayCalendarRepository
                    .findByTenantIdAndYearAndDeletedFalse(tenantId, year);
            if (!calendars.isEmpty()) {
                calendar = calendars.get(0);
            }
        }

        if (calendar == null) {
            return false;
        }

        List<HolidayCalendarDay> days = holidayCalendarDayRepository
                .findByHolidayCalendarIdAndHolidayDateAndDeletedFalse(calendar.getId(), date);
        
        for (HolidayCalendarDay day : days) {
            if (day.isActive() && !day.isOptionalHoliday()) {
                return true;
            }
        }

        return false;
    }
}
