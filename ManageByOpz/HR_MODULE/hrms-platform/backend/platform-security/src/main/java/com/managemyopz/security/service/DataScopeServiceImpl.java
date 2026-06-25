package com.managemyopz.security.service;

import com.managemyopz.security.entity.DataScopeRule;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.DataScopeRuleRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataScopeServiceImpl implements DataScopeService {

    private final DataScopeRuleRepository dataScopeRuleRepository;
    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private static final Map<String, Integer> SCOPE_PRIORITIES = Map.of(
            "GLOBAL", 9,
            "ALL_DATA", 9,
            "TENANT", 8,
            "ORGANIZATION", 7,
            "BUSINESS_UNIT", 6,
            "DIVISION", 5,
            "DEPARTMENT", 4,
            "TEAM", 3,
            "DIRECT_REPORTS", 2,
            "SELF_ONLY", 1
    );

    @Override
    @Transactional(readOnly = true)
    public List<DataScopeRule> getAllDataScopeRules() {
        return dataScopeRuleRepository.findAll();
    }

    @Override
    @Transactional
    public DataScopeRule saveDataScopeRule(DataScopeRule rule, String actor) {
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "ACME";
        rule.setTenantId(tenant);

        // Ensure update of existing rule if it matches role code and tenant
        Optional<DataScopeRule> existing = dataScopeRuleRepository.findByRoleCodeAndTenantId(rule.getRoleCode(), tenant);
        if (existing.isPresent()) {
            DataScopeRule dbRule = existing.get();
            dbRule.setScopeType(rule.getScopeType().toUpperCase());
            dbRule.setRuleText(rule.getRuleText());
            return dataScopeRuleRepository.save(dbRule);
        }
        rule.setScopeType(rule.getScopeType().toUpperCase());
        return dataScopeRuleRepository.save(rule);
    }

    @Override
    @Transactional
    public void deleteDataScopeRule(UUID id, String actor) {
        dataScopeRuleRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public String getDataScopeForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND")));

        // Ultra Super Admin is Global
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            return "GLOBAL";
        }

        String tenant = user.getTenantId() != null ? user.getTenantId() : "ACME";
        String highestScope = "SELF_ONLY";
        int highestPriority = 1;

        for (Role role : user.getRoles()) {
            Optional<DataScopeRule> ruleOpt = dataScopeRuleRepository.findByRoleCodeAndTenantId(role.getCode(), tenant);
            if (ruleOpt.isPresent()) {
                String scope = ruleOpt.get().getScopeType().toUpperCase();
                int priority = SCOPE_PRIORITIES.getOrDefault(scope, 1);
                if (priority > highestPriority) {
                    highestPriority = priority;
                    highestScope = scope;
                }
            }
        }

        return highestScope;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRecordInScope(String username, UUID employeeId) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND")));

        // Ultra Super Admin bypass
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            return true;
        }

        String scope = getDataScopeForUser(username);
        if ("GLOBAL".equals(scope) || "ALL_DATA".equals(scope)) {
            return true;
        }

        String userEmployeeIdStr = user.getEmployeeId();
        if (userEmployeeIdStr == null || userEmployeeIdStr.isBlank()) {
            // User does not have an employee twin record associated.
            // If scope is TENANT, they can access. Otherwise, denied.
            return "TENANT".equals(scope);
        }

        UUID userEmployeeId = UUID.fromString(userEmployeeIdStr);

        // Fetch User's Employee Twin details using Native Query
        Map<String, Object> userTwin = fetchEmployeeDetails(userEmployeeId);
        if (userTwin.isEmpty()) {
            return "TENANT".equals(scope);
        }

        // Fetch Target Employee Twin details
        Map<String, Object> targetTwin = fetchEmployeeDetails(employeeId);
        if (targetTwin.isEmpty()) {
            return false;
        }

        // Check tenant boundary
        String userTenant = (String) userTwin.get("tenant_id");
        String targetTenant = (String) targetTwin.get("tenant_id");
        if (userTenant == null || !userTenant.equalsIgnoreCase(targetTenant)) {
            return false;
        }

        if ("TENANT".equals(scope)) {
            return true;
        }

        if ("SELF_ONLY".equals(scope)) {
            return userEmployeeId.equals(employeeId);
        }

        if ("ORGANIZATION".equals(scope)) {
            return Objects.equals(userTwin.get("organization_id"), targetTwin.get("organization_id"));
        }

        if ("BUSINESS_UNIT".equals(scope)) {
            return Objects.equals(userTwin.get("business_unit_id"), targetTwin.get("business_unit_id"));
        }

        if ("DIVISION".equals(scope)) {
            return Objects.equals(userTwin.get("division_id"), targetTwin.get("division_id"));
        }

        if ("DEPARTMENT".equals(scope)) {
            return Objects.equals(userTwin.get("department_id"), targetTwin.get("department_id"));
        }

        if ("TEAM".equals(scope)) {
            return Objects.equals(userTwin.get("manager_id"), targetTwin.get("manager_id"));
        }

        if ("DIRECT_REPORTS".equals(scope)) {
            // True if self OR reports directly or indirectly
            if (userEmployeeId.equals(employeeId)) {
                return true;
            }
            return isReportOf(userEmployeeId, employeeId);
        }

        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> filterAccessibleEmployeeIds(String username, List<UUID> employeeIds) {
        if (employeeIds == null || employeeIds.isEmpty()) {
            return Collections.emptyList();
        }
        return employeeIds.stream()
                .filter(id -> isRecordInScope(username, id))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchEmployeeDetails(UUID id) {
        String idStr = id.toString();
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT HEX(organization_id), HEX(business_unit_id), HEX(division_id), HEX(department_id), HEX(manager_id), tenant_id " +
                        "FROM employee_twins WHERE id = UNHEX(REPLACE(:id, '-', ''))")
                .setParameter("id", idStr)
                .getResultList();

        if (rows.isEmpty()) {
            return Collections.emptyMap();
        }

        Object[] row = rows.get(0);
        Map<String, Object> map = new HashMap<>();
        map.put("organization_id", row[0]);
        map.put("business_unit_id", row[1]);
        map.put("division_id", row[2]);
        map.put("department_id", row[3]);
        map.put("manager_id", row[4]);
        map.put("tenant_id", row[5]);
        return map;
    }

    @SuppressWarnings("unchecked")
    private boolean isReportOf(UUID managerId, UUID employeeId) {
        // Recursive check or iterative manager walk up
        UUID currentEmployee = employeeId;
        Set<UUID> visited = new HashSet<>(); // prevent cycles

        while (currentEmployee != null && !visited.contains(currentEmployee)) {
            visited.add(currentEmployee);
            String empIdStr = currentEmployee.toString();

            List<Object> rows = entityManager.createNativeQuery(
                    "SELECT HEX(manager_id) FROM employee_twins WHERE id = UNHEX(REPLACE(:id, '-', ''))")
                    .setParameter("id", empIdStr)
                    .getResultList();

            if (rows.isEmpty() || rows.get(0) == null) {
                break;
            }

            String managerHex = (String) rows.get(0);
            UUID currentManager = parseHexUuid(managerHex);

            if (managerId.equals(currentManager)) {
                return true;
            }

            currentEmployee = currentManager;
        }

        return false;
    }

    private UUID parseHexUuid(String hex) {
        if (hex == null || hex.isBlank()) {
            return null;
        }
        try {
            String uuidStr = hex.substring(0, 8) + "-" +
                    hex.substring(8, 12) + "-" +
                    hex.substring(12, 16) + "-" +
                    hex.substring(16, 20) + "-" +
                    hex.substring(20);
            return UUID.fromString(uuidStr);
        } catch (Exception e) {
            return null;
        }
    }
}
