package com.managemyopz.security.service;

import com.managemyopz.security.entity.DataScopeRule;
import java.util.List;
import java.util.UUID;

public interface DataScopeService {
    List<DataScopeRule> getAllDataScopeRules();
    DataScopeRule saveDataScopeRule(DataScopeRule rule, String actor);
    void deleteDataScopeRule(UUID id, String actor);
    String getDataScopeForUser(String username);
    boolean isRecordInScope(String username, UUID employeeId);
    List<UUID> filterAccessibleEmployeeIds(String username, List<UUID> employeeIds);
}
