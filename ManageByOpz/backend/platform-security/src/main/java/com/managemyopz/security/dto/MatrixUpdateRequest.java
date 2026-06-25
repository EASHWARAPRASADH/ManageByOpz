package com.managemyopz.security.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class MatrixUpdateRequest {
    private String targetType; // ROLE, USER
    private UUID targetId;
    private UUID pageId;
    private UUID permissionId;
    private boolean allow;
}
