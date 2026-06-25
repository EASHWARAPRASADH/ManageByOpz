package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recognition_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionComment extends BaseEntity {
    @Column(name = "recognition_id", nullable = false)
    private UUID recognitionId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;
}
