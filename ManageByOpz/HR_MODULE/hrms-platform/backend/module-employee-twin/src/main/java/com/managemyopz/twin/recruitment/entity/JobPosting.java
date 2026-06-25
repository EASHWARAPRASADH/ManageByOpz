package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import com.managemyopz.orgdna.entity.Position;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "location")
    private String location;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "experience")
    private String experience;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "status")
    private String status = "DRAFT"; // DRAFT, PUBLISHED, PAUSED, CLOSED, ARCHIVED
}
