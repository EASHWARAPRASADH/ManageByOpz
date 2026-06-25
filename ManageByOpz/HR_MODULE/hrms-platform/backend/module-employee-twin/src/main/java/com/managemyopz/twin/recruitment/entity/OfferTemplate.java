package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "offer_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfferTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "template_type", nullable = false)
    private String templateType;

    @Column(name = "template_html", columnDefinition = "TEXT", nullable = false)
    private String templateHtml;
}
