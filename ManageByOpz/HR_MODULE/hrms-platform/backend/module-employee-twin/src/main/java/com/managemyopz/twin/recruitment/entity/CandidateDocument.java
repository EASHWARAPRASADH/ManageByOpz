package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "file_size")
    private Long fileSize;
}
