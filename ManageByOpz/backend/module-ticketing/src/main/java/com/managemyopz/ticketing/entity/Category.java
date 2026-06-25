package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseLongEntity {

    

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;
    // createdAt inherited from BaseEntity
}
