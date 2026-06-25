package com.managemyopz.leave.controller;

import com.managemyopz.leave.service.LeaveAnalyticsService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/leave/analytics")
@RequiredArgsConstructor
public class LeaveAnalyticsController {

    private final LeaveAnalyticsService analyticsService;

    @GetMapping("/burnout/{employeeId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBurnoutRisk(@PathVariable UUID employeeId) {
        Map<String, Object> risk = analyticsService.getBurnoutRisk(employeeId);
        return ResponseEntity.ok(ApiResponse.success(risk, "Burnout risk retrieved successfully"));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRiskHeatmap() {
        List<Map<String, Object>> heatmap = analyticsService.getOrganizationRiskHeatmap();
        return ResponseEntity.ok(ApiResponse.success(heatmap, "Risk heatmap retrieved successfully"));
    }

    @GetMapping("/exhaustion/{employeeId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExhaustionPrediction(@PathVariable UUID employeeId) {
        Map<String, Object> prediction = analyticsService.getExhaustionPrediction(employeeId);
        return ResponseEntity.ok(ApiResponse.success(prediction, "Exhaustion prediction retrieved successfully"));
    }

    @GetMapping("/patterns")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFrequentAbsenteePatterns() {
        List<Map<String, Object>> patterns = analyticsService.getFrequentAbsenteePatterns();
        return ResponseEntity.ok(ApiResponse.success(patterns, "Frequent absentee patterns retrieved successfully"));
    }
}
