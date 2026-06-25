package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "candidate_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @Column(name = "note_text", nullable = false, columnDefinition = "TEXT")
    private String noteText;

    @Column(name = "author_id")
    private UUID authorId;
}
