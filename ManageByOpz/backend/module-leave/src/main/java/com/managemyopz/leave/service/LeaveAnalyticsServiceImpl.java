package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.LeaveRequestRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveAnalyticsServiceImpl implements LeaveAnalyticsService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeTwinRepository employeeTwinRepository;

    @Override
    public Map<String, Object> getBurnoutRisk(UUID employeeId) {
        EmployeeTwin emp = employeeTwinRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee twin not found: " + employeeId));

        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndDeletedFalse(employeeId);

        double totalSickLeaveDays = 0.0;
        double totalLeaveDays = 0.0;

        for (LeaveRequest req : requests) {
            if (req.getStatus() == LeaveRequest.LeaveStatus.APPROVED) {
                totalLeaveDays += req.getDaysCount();
                // Simple string checking for sick leave types
                if (req.getLeaveTypeId().toString().contains("sick") || req.getReason().toLowerCase().contains("sick") || req.getReason().toLowerCase().contains("medical")) {
                    totalSickLeaveDays += req.getDaysCount();
                }
            }
        }

        double remainingBalance = balances.stream().mapToDouble(LeaveBalance::getBalance).sum();
        double totalAllocated = balances.stream().mapToDouble(LeaveBalance::getTotalAllocated).sum();

        // Calculations
        // Low remaining balance penalty (if they haven't taken leaves, balance is high, but if balance is very low, they might have exhausted and are burnout-prone)
        double utilization = totalAllocated > 0 ? (totalLeaveDays / totalAllocated) : 0.0;
        
        // Let's compute a realistic score:
        // High utilization (>80%) + low remaining balance + high sick leaves = high burnout risk
        double burnoutScore = 20.0; // Base risk
        if (utilization > 0.8) burnoutScore += 30.0;
        if (remainingBalance < 3.0) burnoutScore += 20.0;
        if (totalSickLeaveDays > 5.0) burnoutScore += 15.0;

        // Cap at 100
        burnoutScore = Math.min(burnoutScore, 100.0);

        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", employeeId);
        result.put("employeeName", emp.getFullName());
        result.put("burnoutScore", burnoutScore);
        result.put("utilization", utilization * 100);
        result.put("sickLeaves", totalSickLeaveDays);
        result.put("riskLevel", burnoutScore > 75 ? "HIGH" : (burnoutScore > 40 ? "MEDIUM" : "LOW"));
        result.put("attritionCorrelation", burnoutScore > 70 ? "HIGH_CORRELATION" : "LOW_CORRELATION");

        return result;
    }

    @Override
    public List<Map<String, Object>> getOrganizationRiskHeatmap() {
        String tenant = TenantContext.getCurrentTenant();
        List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenant);
        List<Map<String, Object>> heatmap = new ArrayList<>();

        for (EmployeeTwin emp : employees) {
            try {
                heatmap.add(getBurnoutRisk(emp.getId()));
            } catch (Exception ignored) {}
        }

        return heatmap;
    }

    @Override
    public Map<String, Object> getExhaustionPrediction(UUID employeeId) {
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        double totalBalance = balances.stream().mapToDouble(LeaveBalance::getBalance).sum();

        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        double totalDaysRequested = requests.stream()
                .filter(r -> r.getStartDate().getYear() == LocalDate.now().getYear())
                .mapToDouble(LeaveRequest::getDaysCount).sum();

        // Calculate rate: total requested days divided by months passed in the current year
        int monthValue = LocalDate.now().getMonthValue();
        double burnRatePerMonth = totalDaysRequested / (double) monthValue;
        if (burnRatePerMonth <= 0.0) {
            burnRatePerMonth = 1.0; // Default estimate
        }

        double monthsUntilExhaustion = totalBalance / burnRatePerMonth;
        LocalDate predictedExhaustionDate = LocalDate.now().plusDays((long) (monthsUntilExhaustion * 30));

        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", employeeId);
        result.put("availableBalance", totalBalance);
        result.put("monthlyBurnRate", burnRatePerMonth);
        result.put("predictedDaysToExhaustion", (int) (monthsUntilExhaustion * 30));
        result.put("predictedExhaustionDate", predictedExhaustionDate);

        return result;
    }

    @Override
    public List<Map<String, Object>> getFrequentAbsenteePatterns() {
        String tenant = TenantContext.getCurrentTenant();
        List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenant);
        List<Map<String, Object>> patterns = new ArrayList<>();

        for (EmployeeTwin emp : employees) {
            List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdAndDeletedFalse(emp.getId());
            int mondayFridayLeaves = 0;
            int totalApprovedLeaves = 0;

            for (LeaveRequest req : requests) {
                if (req.getStatus() == LeaveRequest.LeaveStatus.APPROVED) {
                    totalApprovedLeaves++;
                    DayOfWeek day = req.getStartDate().getDayOfWeek();
                    if (day == DayOfWeek.MONDAY || day == DayOfWeek.FRIDAY) {
                        mondayFridayLeaves++;
                    }
                }
            }

            double ratio = totalApprovedLeaves > 0 ? (double) mondayFridayLeaves / totalApprovedLeaves : 0.0;
            if (ratio > 0.5 && totalApprovedLeaves >= 3) {
                Map<String, Object> p = new HashMap<>();
                p.put("employeeId", emp.getId());
                p.put("employeeName", emp.getFullName());
                p.put("employeeCode", emp.getEmployeeCode());
                p.put("mondayFridayLeaves", mondayFridayLeaves);
                p.put("totalLeaves", totalApprovedLeaves);
                p.put("weekendAdjacentRatio", ratio * 100);
                p.put("patternAbuseSuspected", ratio > 0.7);
                patterns.add(p);
            }
        }

        return patterns;
    }
}
