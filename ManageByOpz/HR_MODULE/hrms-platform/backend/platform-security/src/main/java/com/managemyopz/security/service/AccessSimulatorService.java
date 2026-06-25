package com.managemyopz.security.service;

public interface AccessSimulatorService {
    String generateSimulationToken(String username, String tenantId, String roleCode, String employeeId);
}
