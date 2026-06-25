package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reward_catalogs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RewardCatalog extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cost", nullable = false)
    private int cost;

    @Column(name = "inventory")
    @Builder.Default
    private int inventory = 999;

    @Column(name = "country")
    @Builder.Default
    private String country = "ALL";

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "tax_applicable")
    @Builder.Default
    private boolean taxApplicable = false;

    @Column(name = "category")
    @Builder.Default
    private String category = "GIFT_CARD";
}
