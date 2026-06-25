package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Location extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "address", columnDefinition = "TEXT") private String address;
    @Column(name = "city") private String city;
    @Column(name = "state") private String state;
    @Column(name = "country") private String country;
    @Column(name = "postal_code") private String postalCode;
    @Column(name = "timezone") private String timezone;
    @Column(name = "location_type") private String locationType; // HQ, BRANCH, REMOTE
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("org-locs")
    private Organization organization;
}
