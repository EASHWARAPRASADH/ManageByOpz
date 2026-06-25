package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedback extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    @JsonIgnore
    private Interview interview;

    @Column(name = "interviewer_id", nullable = false)
    private UUID interviewerId;

    @Column(name = "technical_rating")
    private Integer technicalRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "problem_solving_rating")
    private Integer problemSolvingRating;

    @Column(name = "culture_fit_rating")
    private Integer cultureFitRating;

    @Column(name = "overall_recommendation")
    private String overallRecommendation; // STRONG_HIRE, HIRE, MAYBE, REJECT, STRONG_REJECT

    @Column(name = "feedback_notes", columnDefinition = "TEXT")
    private String feedbackNotes;
}
