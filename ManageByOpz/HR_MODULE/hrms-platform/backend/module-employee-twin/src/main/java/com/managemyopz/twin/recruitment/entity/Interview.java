package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Interview extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "interview_type", nullable = false)
    private String interviewType; // PHONE_SCREENING, TECHNICAL_ROUND, MANAGER_ROUND, HR_ROUND, CLIENT_ROUND

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "interviewer_ids", columnDefinition = "TEXT")
    private String interviewerIds; // comma-separated UUIDs of users/employees

    @Column(name = "status")
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterviewFeedback> feedbackList = new ArrayList<>();
}
