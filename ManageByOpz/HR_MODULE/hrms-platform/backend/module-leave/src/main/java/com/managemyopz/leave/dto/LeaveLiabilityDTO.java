package com.managemyopz.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveLiabilityDTO {
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private double leaveBalance;
    private double dailySalary;
    private double totalLiability;
}
