package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "company_email_configs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyEmailConfig extends BaseLongEntity {
    
    @Column(name = "company_name", nullable = false)                         private String companyName;
    @Column(name = "email_address", nullable = false, unique = true)         private String emailAddress;
    @Column(name = "smtp_host", nullable = false)                            private String smtpHost;
    @Column(name = "smtp_port", nullable = false)                            private Integer smtpPort;
    @Column(name = "smtp_user", nullable = false)                            private String smtpUser;
    @Column(name = "smtp_pass", nullable = false)                            private String smtpPass;
    @Column(name = "imap_host", nullable = false)                            private String imapHost;
    @Column(name = "imap_port", nullable = false)                            private Integer imapPort;
    @Column(name = "imap_user", nullable = false)                            private String imapUser;
    @Column(name = "imap_pass", nullable = false)                            private String imapPass;
    @Column(length = 20)                                                     private String encryption = "TLS";
    @Column(name = "is_active")                                              private Boolean isActive = true;
    @Column(name = "is_default")                                             private Boolean isDefault = false;
}
