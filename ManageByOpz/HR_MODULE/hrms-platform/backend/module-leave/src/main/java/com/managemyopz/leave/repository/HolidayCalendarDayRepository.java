package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.HolidayCalendarDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HolidayCalendarDayRepository extends JpaRepository<HolidayCalendarDay, UUID> {
    List<HolidayCalendarDay> findByHolidayCalendarIdAndDeletedFalse(UUID holidayCalendarId);
    Optional<HolidayCalendarDay> findByIdAndDeletedFalse(UUID id);
    List<HolidayCalendarDay> findByHolidayCalendarIdAndHolidayDateAndDeletedFalse(UUID holidayCalendarId, LocalDate holidayDate);
}
