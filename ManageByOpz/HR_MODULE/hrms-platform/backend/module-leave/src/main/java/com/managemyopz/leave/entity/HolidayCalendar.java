package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "holiday_calendars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HolidayCalendar extends BaseEntity {

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "calendar_name", nullable = false)
    private String calendarName;

    @Column(name = "country")
    private String country;

    @Column(name = "state")
    private String state;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
