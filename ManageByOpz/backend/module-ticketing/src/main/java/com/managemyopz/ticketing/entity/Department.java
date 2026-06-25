package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "TicketingDepartment")
@Table(name = "ticketing_departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseLongEntity {

    

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;
    // createdAt inherited from BaseEntity
}
