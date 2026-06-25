package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeavePolicyAssignment;
import com.managemyopz.leave.entity.LeavePolicyRule;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.LeavePolicyAssignmentRepository;
import com.managemyopz.leave.repository.LeavePolicyRuleRepository;
import com.managemyopz.leave.repository.LeaveRequestRepository;
import com.managemyopz.leave.repository.LeaveTypeRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LeavePolicyAssignmentServiceImpl implements LeavePolicyAssignmentService {

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private LeavePolicyAssignmentRepository leavePolicyAssignmentRepository;

    @Autowired
    private LeavePolicyRuleRepository leavePolicyRuleRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Override
    @Transactional(readOnly = true)
    public UUID resolvePolicy(UUID employeeId) {
        EmployeeTwin employee = employeeTwinRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return null;
        }

        String tenant = TenantContext.getCurrentTenant();
        List<LeavePolicyAssignment> assignments = leavePolicyAssignmentRepository.findByTenantIdAndDeletedFalse(tenant);

        LeavePolicyAssignment bestMatch = null;
        int bestScore = -1;

        for (LeavePolicyAssignment ass : assignments) {
            int score = 0;
            boolean mismatch = false;

            if (ass.getOrganizationId() != null) {
                if (ass.getOrganizationId().equals(employee.getOrganizationId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }
            if (ass.getBusinessUnitId() != null) {
                if (ass.getBusinessUnitId().equals(employee.getBusinessUnitId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }
            if (ass.getDepartmentId() != null) {
                if (ass.getDepartmentId().equals(employee.getDepartmentId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }
            if (ass.getGradeId() != null) {
                if (ass.getGradeId().equals(employee.getGradeId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }
            if (ass.getBandId() != null) {
                if (ass.getBandId().equals(employee.getBandId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }
            if (ass.getEmploymentTypeId() != null) {
                if (ass.getEmploymentTypeId().equals(employee.getEmploymentTypeId())) {
                    score++;
                } else {
                    mismatch = true;
                }
            }

            if (!mismatch) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = ass;
                }
            }
        }

        return bestMatch != null ? bestMatch.getPolicyId() : null;
    }

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
                return false; // Only eligible if on probation
            }
        }

        return true;
    }

    @Override
    @Transactional
    public void generateWallets(UUID employeeId) {
        EmployeeTwin employee = employeeTwinRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return;
        }

        UUID policyId = resolvePolicy(employeeId);
        int currentYear = LocalDate.now().getYear();

        if (policyId == null) {
            // Fallback: Default leave types
            String tenant = TenantContext.getCurrentTenant();
            List<LeaveType> leaveTypes = leaveTypeRepository.findByTenantIdAndDeletedFalse(tenant);
            for (LeaveType type : leaveTypes) {
                if (type.isActive() && isEligible(employee, type)) {
                    boolean exists = leaveBalanceRepository
                            .findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(employeeId, type.getId(), currentYear)
                            .isPresent();
                    if (!exists) {
                        LeaveBalance balance = new LeaveBalance();
                        balance.setEmployeeId(employeeId);
                        balance.setLeaveTypeId(type.getId());
                        balance.setYear(currentYear);
                        balance.setTotalAllocated(type.getDefaultDays());
                        balance.setCarriedForward(0.0);
                        balance.setTotalUsed(0.0);
                        balance.setTotalPending(0.0);
                        balance.setBalance(type.getDefaultDays());
                        balance.setTenantId(TenantContext.getCurrentTenant());
                        balance.setDeleted(false);
                        leaveBalanceRepository.save(balance);
                    }
                }
            }
        } else {
            List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(policyId);
            for (LeavePolicyRule rule : rules) {
                LeaveType type = leaveTypeRepository.findById(rule.getLeaveTypeId()).orElse(null);
                if (type != null && type.isActive() && isEligible(employee, type)) {
                    boolean exists = leaveBalanceRepository
                            .findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(employeeId, rule.getLeaveTypeId(), currentYear)
                            .isPresent();
                    if (!exists) {
                        LeaveBalance balance = new LeaveBalance();
                        balance.setEmployeeId(employeeId);
                        balance.setLeaveTypeId(rule.getLeaveTypeId());
                        balance.setYear(currentYear);
                        balance.setTotalAllocated(rule.getAllocatedDays());
                        balance.setCarriedForward(0.0);
                        balance.setTotalUsed(0.0);
                        balance.setTotalPending(0.0);
                        balance.setBalance(rule.getAllocatedDays());
                        balance.setTenantId(TenantContext.getCurrentTenant());
                        balance.setDeleted(false);
                        leaveBalanceRepository.save(balance);
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public void regenerateWallets(UUID employeeId) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveBalance> existingBalances = leaveBalanceRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        for (LeaveBalance bal : existingBalances) {
            if (bal.getYear() == currentYear) {
                bal.softDelete("system-reassignment");
                leaveBalanceRepository.save(bal);
            }
        }
        generateWallets(employeeId);
        recalculateBalances(employeeId);
    }

    @Override
    @Transactional
    public void recalculateBalances(UUID employeeId) {
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdAndDeletedFalse(employeeId);

        for (LeaveBalance bal : balances) {
            double totalUsed = 0.0;
            double totalPending = 0.0;

            for (LeaveRequest req : requests) {
                if (req.getLeaveTypeId().equals(bal.getLeaveTypeId()) && req.getStartDate().getYear() == bal.getYear()) {
                    if (req.getStatus() == LeaveRequest.LeaveStatus.APPROVED) {
                        totalUsed += req.getDaysCount();
                    } else if (req.getStatus() == LeaveRequest.LeaveStatus.PENDING || 
                               req.getStatus() == LeaveRequest.LeaveStatus.PENDING_L1 ||
                               req.getStatus() == LeaveRequest.LeaveStatus.PENDING_L2 ||
                               req.getStatus() == LeaveRequest.LeaveStatus.PENDING_L3) {
                        totalPending += req.getDaysCount();
                    }
                }
            }

            bal.setTotalUsed(totalUsed);
            bal.setTotalPending(totalPending);
            bal.setBalance(bal.getTotalAllocated() + bal.getCarriedForward() - totalUsed);
            leaveBalanceRepository.save(bal);
        }
    }
}
