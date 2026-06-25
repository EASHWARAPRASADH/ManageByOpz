package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "assets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Asset extends BaseLongEntity {
    
    @Column(nullable = false)                               private String name;
    @Column(length = 50)                                    private String type = "Hardware";
    @Column(length = 50)                                    private String status = "Operational";
    @Column(length = 128)                                   private String owner;
    @Column(name = "owner_name")                            private String ownerName;
    @Column(length = 255)                                   private String location;
    @Column(name = "serial_number",  length = 255)          private String serialNumber;
    @Column(length = 255)                                   private String model;
    @Column(length = 255)                                   private String manufacturer;
    @Column(name = "purchase_date")                         private LocalDate purchaseDate;
    @Column(name = "warranty_expiry")                       private LocalDate warrantyExpiry;
    @Column(name = "ip_address",     length = 50)           private String ipAddress;
    @Column(columnDefinition = "TEXT")                      private String description;
}
