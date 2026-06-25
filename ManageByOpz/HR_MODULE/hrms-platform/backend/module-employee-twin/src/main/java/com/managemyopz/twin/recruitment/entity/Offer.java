package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import com.managemyopz.orgdna.entity.Position;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Offer extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    @Column(name = "ctc", nullable = false)
    private BigDecimal ctc;

    @Column(name = "bonus")
    private BigDecimal bonus;

    @Column(name = "joining_bonus")
    private BigDecimal joiningBonus;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Column(name = "location")
    private String location;

    @Column(name = "status")
    private String status = "DRAFT"; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, RELEASED, ACCEPTED, DECLINED, JOINED

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfferApproval> approvals = new ArrayList<>();
}
