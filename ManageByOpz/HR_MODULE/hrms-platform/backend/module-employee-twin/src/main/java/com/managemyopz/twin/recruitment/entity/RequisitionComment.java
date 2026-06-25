package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionComment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    @JsonIgnore
    private Requisition requisition;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "author_name")
    private String authorName;
}
