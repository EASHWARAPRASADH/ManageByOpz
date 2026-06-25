package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "ticket_custom_fields", indexes = {
    @Index(name = "idx_tcf_ticket", columnList = "ticket_id")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketCustomField extends BaseLongEntity {
    
    @Column(name = "ticket_id",    nullable = false, length = 128) private String ticketId;
    @Column(name = "category_id",  nullable = false)               private Long categoryId;
    @Column(name = "category_name",nullable = false, length = 255) private String categoryName;
    @Column(name = "value_text",   nullable = false, length = 255) private String valueText;
}
