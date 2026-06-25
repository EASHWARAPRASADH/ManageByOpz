package com.managemyopz.security.service;

import com.managemyopz.security.entity.SecurityPage;
import java.util.List;

public interface PageAccessService {
    List<SecurityPage> getAllPages();
    boolean isPageAccessible(String pageCode, String tenantId);
}
