package com.managemyopz.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowPreviewDto {
    private String approvalType;
    private List<ApproverStepDto> steps;
    private int totalSteps;
    private String escalationPath;
    private String slaHours;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApproverStepDto {
        private int levelNumber;
        private String approverType;
        private String approverEmail;
        private String approverName;
    }
}
