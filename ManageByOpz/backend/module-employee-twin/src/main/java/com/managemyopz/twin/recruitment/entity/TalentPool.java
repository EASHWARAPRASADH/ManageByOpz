package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "talent_pools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TalentPool extends BaseEntity {

    @Column(name = "pool_name", nullable = false)
    private String poolName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @ManyToMany
    @JoinTable(
        name = "candidate_talent_pool",
        joinColumns = @JoinColumn(name = "talent_pool_id"),
        inverseJoinColumns = @JoinColumn(name = "candidate_id")
    )
    private List<Candidate> candidates = new ArrayList<>();
}
