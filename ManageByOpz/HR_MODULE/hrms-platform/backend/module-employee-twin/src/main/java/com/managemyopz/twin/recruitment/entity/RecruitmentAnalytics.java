package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recruitment_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentAnalytics extends BaseEntity {

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(name = "metric_value")
    private BigDecimal metricValue;

    @Column(name = "metric_date")
    private LocalDate metricDate;
}
