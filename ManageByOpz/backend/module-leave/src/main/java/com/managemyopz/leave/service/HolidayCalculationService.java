package com.managemyopz.leave.service;

import java.time.LocalDate;
import java.util.UUID;

public interface HolidayCalculationService {
    double calculateWorkingDays(UUID employeeId, LocalDate startDate, LocalDate endDate);
    boolean isWeekend(UUID employeeId, LocalDate date);
    boolean isHoliday(UUID employeeId, LocalDate date);
}
