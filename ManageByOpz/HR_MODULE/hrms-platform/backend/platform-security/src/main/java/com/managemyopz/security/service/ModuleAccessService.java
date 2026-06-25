package com.managemyopz.security.service;

import com.managemyopz.security.entity.SecurityModule;
import java.util.List;

public interface ModuleAccessService {
    List<SecurityModule> getAllModules();
    boolean isModuleAccessible(String moduleCode, String tenantId);
}
