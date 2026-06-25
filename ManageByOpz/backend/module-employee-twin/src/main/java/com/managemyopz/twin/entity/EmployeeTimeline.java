package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * EmployeeTimeline — Immutable timeline tracking all lifecycle events.
 */
@Entity @Table(name = "employee_timeline")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeTimeline extends BaseEntity {
    @Column(name = "event_type", nullable = false) @Enumerated(EnumType.STRING)
    private TimelineEventType eventType;
    @Column(name = "event_date", nullable = false) private LocalDate eventDate;
    @Column(name = "title", nullable = false) private String title;
    @Column(name = "description", columnDefinition = "TEXT") private String description;
    @Column(name = "metadata_json", columnDefinition = "JSON") private String metadataJson;
    @Column(name = "triggered_by") private String triggeredBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;

    public enum TimelineEventType {
        JOINING, CONFIRMATION, PROMOTION, TRANSFER, RECOGNITION, TRAINING,
        SALARY_REVISION, CERTIFICATION, WARNING, SUSPENSION, RESIGNATION,
        TERMINATION, RETIREMENT, REHIRE, ROLE_CHANGE, DEPARTMENT_CHANGE, LOCATION_CHANGE
    }
}
