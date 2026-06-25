package com.managemyopz.leave.service;

import com.managemyopz.leave.dto.LeaveLiabilityDTO;
import java.util.List;
import java.util.Map;

public interface LeaveLiabilityService {
    List<LeaveLiabilityDTO> getLiabilityReport();
    Map<String, Object> getLiabilityDashboardMetrics();
}
