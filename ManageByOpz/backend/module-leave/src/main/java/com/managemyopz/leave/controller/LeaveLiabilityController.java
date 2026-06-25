package com.managemyopz.leave.controller;

import com.managemyopz.leave.dto.LeaveLiabilityDTO;
import com.managemyopz.leave.service.LeaveLiabilityService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/leave/liability")
@RequiredArgsConstructor
public class LeaveLiabilityController {

    private final LeaveLiabilityService liabilityService;

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<List<LeaveLiabilityDTO>>> getLiabilityReport() {
        List<LeaveLiabilityDTO> report = liabilityService.getLiabilityReport();
        return ResponseEntity.ok(ApiResponse.success(report, "Liability report retrieved successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLiabilityDashboard() {
        Map<String, Object> metrics = liabilityService.getLiabilityDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Liability dashboard metrics retrieved successfully"));
    }
}
