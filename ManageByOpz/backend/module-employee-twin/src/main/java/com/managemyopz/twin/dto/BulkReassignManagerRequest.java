package com.managemyopz.twin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class BulkReassignManagerRequest {
    private List<UUID> employeeIds;
    private UUID managerId;
    private LocalDate effectiveDate;
    private String reason;
}
