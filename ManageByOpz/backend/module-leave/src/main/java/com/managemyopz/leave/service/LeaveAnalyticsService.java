package com.managemyopz.leave.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface LeaveAnalyticsService {
    Map<String, Object> getBurnoutRisk(UUID employeeId);
    List<Map<String, Object>> getOrganizationRiskHeatmap();
    Map<String, Object> getExhaustionPrediction(UUID employeeId);
    List<Map<String, Object>> getFrequentAbsenteePatterns();
}
