package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "holiday_calendar_days")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HolidayCalendarDay extends BaseEntity {

    @Column(name = "holiday_calendar_id", nullable = false)
    private UUID holidayCalendarId;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Column(name = "holiday_name", nullable = false)
    private String holidayName;

    @Column(name = "holiday_type", nullable = false)
    private String holidayType = "PUBLIC";

    @Column(name = "optional_holiday", nullable = false)
    private boolean optionalHoliday = false;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
