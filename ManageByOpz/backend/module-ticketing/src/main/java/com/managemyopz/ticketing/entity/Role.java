package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "TicketingRole")
@Table(name = "ticketing_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseLongEntity {

    

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
    // createdAt inherited from BaseEntity
}
