package com.managemyopz.security.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TemplateApplyRequest {
    private UUID roleId;
    private String templateCode; // STANDARD_EMPLOYEE, MANAGER, HR_ADMIN
}
