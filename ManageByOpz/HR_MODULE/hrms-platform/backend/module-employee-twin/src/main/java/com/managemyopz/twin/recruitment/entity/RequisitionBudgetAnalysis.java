package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "requisition_budget_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionBudgetAnalysis extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    @JsonIgnore
    private Requisition requisition;

    @Column(name = "dept_headcount")
    private Integer deptHeadcount = 0;

    @Column(name = "open_positions")
    private Integer openPositions = 0;

    @Column(name = "budget_consumed")
    private BigDecimal budgetConsumed = BigDecimal.ZERO;

    @Column(name = "budget_available")
    private BigDecimal budgetAvailable = BigDecimal.ZERO;

    @Column(name = "requested_budget")
    private BigDecimal requestedBudget = BigDecimal.ZERO;

    @Column(name = "projected_budget")
    private BigDecimal projectedBudget = BigDecimal.ZERO;
}
