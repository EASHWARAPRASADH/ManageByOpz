package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.HolidayCalendar;
import com.managemyopz.leave.entity.HolidayCalendarDay;
import com.managemyopz.leave.repository.HolidayCalendarDayRepository;
import com.managemyopz.leave.repository.HolidayCalendarRepository;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/holiday-calendars")
@RequiredArgsConstructor
public class HolidayCalendarController {

    private final HolidayCalendarRepository holidayCalendarRepository;
    private final HolidayCalendarDayRepository holidayCalendarDayRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HolidayCalendar>>> getHolidayCalendars() {
        String tenantId = TenantContext.getCurrentTenant();
        List<HolidayCalendar> calendars = holidayCalendarRepository.findByTenantIdAndDeletedFalse(tenantId);
        return ResponseEntity.ok(ApiResponse.success(calendars, "Holiday calendars retrieved successfully"));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<HolidayCalendar>> createHolidayCalendar(@RequestBody HolidayCalendar calendar) {
        if (calendar.getTenantId() == null) {
            calendar.setTenantId(TenantContext.getCurrentTenant());
        }
        HolidayCalendar saved = holidayCalendarRepository.save(calendar);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Holiday calendar created successfully"));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<HolidayCalendar>> updateHolidayCalendar(@PathVariable UUID id, @RequestBody HolidayCalendar updateData) {
        HolidayCalendar existing = holidayCalendarRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Holiday calendar not found"));
        
        existing.setCalendarName(updateData.getCalendarName());
        existing.setCountry(updateData.getCountry());
        existing.setState(updateData.getState());
        existing.setYear(updateData.getYear());
        existing.setActive(updateData.isActive());
        
        HolidayCalendar saved = holidayCalendarRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Holiday calendar updated successfully"));
    }

    @GetMapping("/{id}/days")
    public ResponseEntity<ApiResponse<List<HolidayCalendarDay>>> getCalendarDays(@PathVariable UUID id) {
        List<HolidayCalendarDay> days = holidayCalendarDayRepository.findByHolidayCalendarIdAndDeletedFalse(id);
        return ResponseEntity.ok(ApiResponse.success(days, "Holiday calendar days retrieved successfully"));
    }

    @PostMapping("/{id}/days")
    @Transactional
    public ResponseEntity<ApiResponse<HolidayCalendarDay>> createCalendarDay(@PathVariable UUID id, @RequestBody HolidayCalendarDay day) {
        day.setHolidayCalendarId(id);
        if (day.getTenantId() == null) {
            day.setTenantId(TenantContext.getCurrentTenant());
        }
        HolidayCalendarDay saved = holidayCalendarDayRepository.save(day);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Holiday calendar day added successfully"));
    }

    @DeleteMapping("/{id}/days/{dayId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteCalendarDay(@PathVariable UUID id, @PathVariable UUID dayId) {
        HolidayCalendarDay day = holidayCalendarDayRepository.findByIdAndDeletedFalse(dayId)
                .orElseThrow(() -> new RuntimeException("Holiday calendar day not found"));
        
        day.softDelete(TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system");
        holidayCalendarDayRepository.save(day);
        return ResponseEntity.ok(ApiResponse.success(null, "Holiday calendar day deleted successfully"));
    }
}
