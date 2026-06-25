package com.managemyopz.security.service;

import com.managemyopz.security.entity.SecurityPage;
import com.managemyopz.security.repository.SecurityPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PageAccessServiceImpl implements PageAccessService {

    private final SecurityPageRepository pageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SecurityPage> getAllPages() {
        return pageRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPageAccessible(String pageCode, String tenantId) {
        return pageRepository.findByPageCode(pageCode)
                .map(SecurityPage::isActive)
                .orElse(false);
    }
}
