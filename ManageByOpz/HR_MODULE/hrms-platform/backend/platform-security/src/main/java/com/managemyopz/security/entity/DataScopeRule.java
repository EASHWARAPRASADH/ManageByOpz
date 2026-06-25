package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "data_scope_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DataScopeRule extends BaseEntity {

    @Column(name = "role_code", nullable = false)
    private String roleCode;

    @Column(name = "scope_type", nullable = false)
    private String scopeType;

    @Column(name = "rule_text", length = 1000)
    private String ruleText;
}
