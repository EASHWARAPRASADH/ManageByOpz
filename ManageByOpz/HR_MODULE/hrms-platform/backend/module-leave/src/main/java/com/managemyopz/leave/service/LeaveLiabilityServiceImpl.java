package com.managemyopz.leave.service;

import com.managemyopz.leave.dto.LeaveLiabilityDTO;
import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.orgdna.entity.Band;
import com.managemyopz.orgdna.entity.Department;
import com.managemyopz.orgdna.repository.BandRepository;
import com.managemyopz.orgdna.repository.DepartmentRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveLiabilityServiceImpl implements LeaveLiabilityService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeTwinRepository employeeTwinRepository;
    private final BandRepository bandRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public List<LeaveLiabilityDTO> getLiabilityReport() {
        String tenant = TenantContext.getCurrentTenant();
        List<LeaveBalance> balances = leaveBalanceRepository.findByTenantIdAndDeletedFalse(tenant);
        List<LeaveLiabilityDTO> list = new ArrayList<>();

        for (LeaveBalance bal : balances) {
            EmployeeTwin emp = employeeTwinRepository.findById(bal.getEmployeeId()).orElse(null);
            if (emp == null) continue;

            double dailySalary = 2000.0; // Default average daily salary
            if (emp.getBandId() != null) {
                Band band = bandRepository.findByIdAndDeletedFalse(emp.getBandId()).orElse(null);
                if (band != null && band.getMinSalary() != null && band.getMaxSalary() != null) {
                    double monthlyAvg = (band.getMinSalary() + band.getMaxSalary()) / 2.0;
                    dailySalary = monthlyAvg / 30.0;
                }
            }

            String deptName = "Unassigned";
            if (emp.getDepartmentId() != null) {
                Department dept = departmentRepository.findById(emp.getDepartmentId()).orElse(null);
                if (dept != null) {
                    deptName = dept.getName();
                }
            }

            double totalLiability = bal.getBalance() * dailySalary;

            list.add(LeaveLiabilityDTO.builder()
                    .employeeId(emp.getId())
                    .employeeName(emp.getFullName())
                    .employeeCode(emp.getEmployeeCode())
                    .departmentName(deptName)
                    .leaveBalance(bal.getBalance())
                    .dailySalary(dailySalary)
                    .totalLiability(totalLiability)
                    .build());
        }

        return list;
    }

    @Override
    public Map<String, Object> getLiabilityDashboardMetrics() {
        List<LeaveLiabilityDTO> report = getLiabilityReport();

        double orgLiability = report.stream().mapToDouble(LeaveLiabilityDTO::getTotalLiability).sum();
        
        // Liability by Department
        Map<String, Double> departmentLiability = report.stream()
                .collect(Collectors.groupingBy(
                        LeaveLiabilityDTO::getDepartmentName,
                        Collectors.summingDouble(LeaveLiabilityDTO::getTotalLiability)
                ));

        // Top 20 Liability Employees
        List<LeaveLiabilityDTO> topEmployees = report.stream()
                .sorted(Comparator.comparingDouble(LeaveLiabilityDTO::getTotalLiability).reversed())
                .limit(20)
                .collect(Collectors.toList());

        // Simple monthly projections/trends simulator
        List<Map<String, Object>> trend = new ArrayList<>();
        double base = orgLiability;
        for (int i = -5; i <= 0; i++) {
            Map<String, Object> t = new HashMap<>();
            t.put("month", LocalDate.now().plusMonths(i).getMonth().name());
            t.put("exposure", base * (1 + (i * 0.02)));
            trend.add(t);
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("organizationLiability", orgLiability);
        metrics.put("departmentLiability", departmentLiability);
        metrics.put("topEmployees", topEmployees);
        metrics.put("liabilityTrend", trend);
        metrics.put("carryForwardExposure", orgLiability * 0.4); // Estimate CF exposure at 40%
        metrics.put("encashmentExposure", orgLiability * 0.15);  // Estimate encashment payout exposure at 15%

        return metrics;
    }
}
