package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;
import com.managemyopz.leave.entity.LeavePolicyRule;
import com.managemyopz.leave.exception.LeaveValidationException;
import com.managemyopz.leave.exception.EmployeeNotFoundException;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.LeaveRequestRepository;
import com.managemyopz.leave.repository.LeavePolicyRuleRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveValidationServiceImpl implements LeaveValidationService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveBalanceCalculator leaveBalanceCalculator;
    private final EmployeeTwinRepository employeeTwinRepository;
    private final HolidayCalculationService holidayCalculationService;
    private final LeavePolicyAssignmentService policyAssignmentService;
    private final LeavePolicyRuleRepository policyRuleRepository;

    private boolean isEligible(EmployeeTwin employee, LeaveType type) {
        if (employee == null || type == null) {
            return false;
        }

        String code = type.getCode() != null ? type.getCode().toUpperCase() : "";
        String name = type.getName() != null ? type.getName().toUpperCase() : "";
        String empGender = employee.getGender() != null ? employee.getGender().toUpperCase() : "";

        // 1. Gender Eligibility Check
        String genderEl = type.getGenderEligibility() != null ? type.getGenderEligibility().toUpperCase() : "";
        if (genderEl.isEmpty() && (code.equals("ML") || name.contains("MATERNITY"))) {
            genderEl = "FEMALE";
        }
        if (genderEl.isEmpty() && (code.equals("PL") || name.contains("PATERNITY"))) {
            genderEl = "MALE";
        }

        if (!genderEl.isEmpty() && !genderEl.equals("ALL")) {
            if (empGender.isEmpty()) {
                return false;
            }
            if (genderEl.equals("FEMALE") && !empGender.equals("FEMALE")) {
                return false;
            }
            if (genderEl.equals("MALE") && !empGender.equals("MALE")) {
                return false;
            }
        }

        // 2. Probation Restriction Check
        if (code.equals("PROBATION") || name.contains("PROBATION")) {
            boolean onProbation = false;
            if (employee.getEmploymentStatus() != null) {
                onProbation = "ON_PROBATION".equalsIgnoreCase(employee.getEmploymentStatus().toString()) 
                        || "PROBATION".equalsIgnoreCase(employee.getEmploymentStatus().toString());
            }
            if (employee.getProbationEndDate() != null && LocalDate.now().isBefore(employee.getProbationEndDate())) {
                onProbation = true;
            }
            if (!onProbation) {
                return false;
            }
        }

        return true;
    }

    @Override
    public void validateRequest(LeaveRequest request, LeaveType leaveType) {
        // 0. Employee existence validation
        EmployeeTwin employee = employeeTwinRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException(request.getEmployeeId()));

        // 0.1 Eligibility Validation Check
        if (!isEligible(employee, leaveType)) {
            throw new LeaveValidationException("NOT_ELIGIBLE", "Employee is not eligible for leave type: " + leaveType.getName());
        }

        // 1. Date Validation
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new LeaveValidationException("INVALID_DATE_RANGE", "Start date and End date are required.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new LeaveValidationException("INVALID_DATE_RANGE", "End date cannot be before start date.");
        }

        // Fetch policy rule
        UUID policyId = policyAssignmentService.resolvePolicy(request.getEmployeeId());
        LeavePolicyRule rule = null;
        if (policyId != null) {
            rule = policyRuleRepository.findByPolicyIdAndLeaveTypeIdAndDeletedFalse(policyId, request.getLeaveTypeId()).orElse(null);
        }

        // 2. Working Days Calculation (excluding weekends and holidays unless sandwich applies)
        double workingDays = 0.0;
        boolean sandwichApplies = rule != null && rule.isSandwichEnabled();
        
        if (request.isHalfDay()) {
            if (!request.getStartDate().isEqual(request.getEndDate())) {
                throw new LeaveValidationException("INVALID_DATE_RANGE", "Half day leave must start and end on the same day.");
            }
            if (holidayCalculationService.calculateWorkingDays(request.getEmployeeId(), request.getStartDate(), request.getEndDate()) > 0) {
                workingDays = 0.5;
            }
        } else {
            if (sandwichApplies) {
                workingDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            } else {
                workingDays = holidayCalculationService.calculateWorkingDays(request.getEmployeeId(), request.getStartDate(), request.getEndDate());
                
                // Prefix / Suffix checks
                if (rule != null) {
                    if (rule.isPrefixEnabled()) {
                        // Check if day before start date is a holiday/weekend
                        LocalDate before = request.getStartDate().minusDays(1);
                        if (holidayCalculationService.calculateWorkingDays(request.getEmployeeId(), before, before) == 0) {
                            workingDays += 1.0;
                        }
                    }
                    if (rule.isSuffixEnabled()) {
                        // Check if day after end date is a holiday/weekend
                        LocalDate after = request.getEndDate().plusDays(1);
                        if (holidayCalculationService.calculateWorkingDays(request.getEmployeeId(), after, after) == 0) {
                            workingDays += 1.0;
                        }
                    }
                }
            }
        }

        if (workingDays == 0.0) {
            throw new LeaveValidationException("INVALID_DATE_RANGE", "Requested dates consist entirely of weekends/holidays.");
        }
        request.setDaysCount(workingDays);

        double requestedDays = request.getDaysCount();

        // 3. Notice Period Validation
        long daysNotice = ChronoUnit.DAYS.between(LocalDate.now(), request.getStartDate());
        int requiredNotice = leaveType.getMinDaysNotice();
        if (rule != null && rule.getMinDaysNotice() != null) {
            requiredNotice = rule.getMinDaysNotice();
        }
        if (requiredNotice > 0 && daysNotice < requiredNotice) {
            throw new LeaveValidationException("POLICY_VIOLATION", "Notice period violation. Minimum notice required: " + requiredNotice + " days.");
        }

        // 4. Max Consecutive Days Validation
        double maxConsecutive = leaveType.getMaxConsecutiveDays();
        if (rule != null && rule.getMaxConsecutiveDays() != null) {
            maxConsecutive = rule.getMaxConsecutiveDays();
        }
        if (maxConsecutive > 0 && requestedDays > maxConsecutive) {
            throw new LeaveValidationException("POLICY_VIOLATION", "Maximum consecutive days limit exceeded. Maximum allowed: " + maxConsecutive + " days.");
        }

        // 5. Probation & Notice Restrictions
        if (rule != null) {
            if (rule.isProbationRestricted()) {
                boolean onProbation = employee.getEmploymentStatus() == EmployeeTwin.EmploymentStatus.ON_PROBATION
                        || (employee.getProbationEndDate() != null && LocalDate.now().isBefore(employee.getProbationEndDate()));
                if (onProbation) {
                    throw new LeaveValidationException("POLICY_VIOLATION", "Leaves of this type are restricted during probation.");
                }
            }
            if (rule.isNoticePeriodRestricted()) {
                boolean onNotice = employee.getEmploymentStatus() == EmployeeTwin.EmploymentStatus.ON_NOTICE;
                if (onNotice) {
                    throw new LeaveValidationException("POLICY_VIOLATION", "Leaves of this type are restricted during notice period.");
                }
            }
        }

        // 6. Overlap Validation
        List<LeaveRequest> overlaps = leaveRequestRepository.findOverlappingRequests(request.getEmployeeId(), request.getStartDate(), request.getEndDate());
        if (request.getId() != null) {
            overlaps.removeIf(o -> o.getId().equals(request.getId()));
        }
        if (!overlaps.isEmpty()) {
            throw new LeaveValidationException("LEAVE_OVERLAP", "Leave overlaps with existing approved or pending leave.");
        }

        // 7. Balance Validation
        int year = request.getStartDate().getYear();
        final LeavePolicyRule finalRule = rule;
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(request.getEmployeeId(), request.getLeaveTypeId(), year)
                .orElseGet(() -> {
                    LeaveBalance newBal = new LeaveBalance();
                    newBal.setEmployeeId(request.getEmployeeId());
                    newBal.setLeaveTypeId(request.getLeaveTypeId());
                    newBal.setYear(year);
                    double defaultDays = finalRule != null ? finalRule.getAllocatedDays() : leaveType.getDefaultDays();
                    newBal.setTotalAllocated(defaultDays);
                    newBal.setBalance(defaultDays);
                    newBal.setTenantId(TenantContext.getCurrentTenant());
                    newBal.setDeleted(false);
                    return leaveBalanceRepository.save(newBal);
                });

        double available = leaveBalanceCalculator.calculateAvailable(balance);
        boolean negativeAllowed = rule != null ? rule.isNegativeBalanceAllowed() : leaveType.isNegativeBalanceAllowed();
        if (!negativeAllowed && available < requestedDays) {
            Map<String, String> details = new HashMap<>();
            details.put("availableBalance", String.valueOf(available));
            details.put("requestedDays", String.valueOf(requestedDays));
            throw new LeaveValidationException("INSUFFICIENT_BALANCE", "Insufficient leave balance. Available: " + available + ", Requested: " + requestedDays, details);
        }
    }
}
