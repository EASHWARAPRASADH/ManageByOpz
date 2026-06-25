package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recognition_values")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionValue extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "weight")
    @Builder.Default
    private Double weight = 1.0;
}
