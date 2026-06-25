package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionDraft extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "draft_data", nullable = false, columnDefinition = "TEXT")
    private String draftData;
}
