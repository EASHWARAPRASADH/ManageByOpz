package com.managemyopz.security.service;

import com.managemyopz.security.dto.DashboardLayoutDto;

public interface DashboardLayoutService {
    DashboardLayoutDto getActiveLayoutForUser(String username);
    DashboardLayoutDto saveLayoutForUser(String username, DashboardLayoutDto layoutDto);
}
