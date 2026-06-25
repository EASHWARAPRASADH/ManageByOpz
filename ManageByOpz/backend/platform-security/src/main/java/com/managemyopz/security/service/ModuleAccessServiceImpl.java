package com.managemyopz.security.service;

import com.managemyopz.security.entity.SecurityModule;
import com.managemyopz.security.repository.SecurityModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleAccessServiceImpl implements ModuleAccessService {

    private final SecurityModuleRepository moduleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SecurityModule> getAllModules() {
        return moduleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isModuleAccessible(String moduleCode, String tenantId) {
        return moduleRepository.findByModuleCode(moduleCode)
                .map(SecurityModule::isActive)
                .orElse(false);
    }
}
