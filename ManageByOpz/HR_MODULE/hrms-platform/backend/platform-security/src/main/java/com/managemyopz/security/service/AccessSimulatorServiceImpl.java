package com.managemyopz.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccessSimulatorServiceImpl implements AccessSimulatorService {

    private final JwtService jwtService;

    @Override
    public String generateSimulationToken(String username, String tenantId, String roleCode, String employeeId) {
        return jwtService.generateToken(username, tenantId, roleCode, employeeId);
    }
}
