package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;
}
