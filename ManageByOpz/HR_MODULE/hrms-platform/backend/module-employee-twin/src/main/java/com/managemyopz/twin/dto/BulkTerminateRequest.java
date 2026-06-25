package com.managemyopz.twin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class BulkTerminateRequest {
    private List<UUID> employeeIds;
    private LocalDate terminationDate;
    private LocalDate finalWorkingDay;
    private String reason;
}
