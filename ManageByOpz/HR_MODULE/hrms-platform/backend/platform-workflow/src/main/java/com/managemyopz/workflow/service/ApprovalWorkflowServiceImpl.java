package com.managemyopz.workflow.service;

import com.managemyopz.orgdna.entity.ApprovalMatrix;
import com.managemyopz.orgdna.entity.ApprovalMatrixLevel;
import com.managemyopz.orgdna.repository.ApprovalMatrixRepository;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.workflow.entity.ApprovalDelegation;
import com.managemyopz.workflow.entity.ApprovalTransaction;
import com.managemyopz.workflow.entity.WorkflowInstance;
import com.managemyopz.workflow.entity.WorkflowInstance.WorkflowStatus;
import com.managemyopz.workflow.repository.ApprovalDelegationRepository;
import com.managemyopz.workflow.repository.ApprovalTransactionRepository;
import com.managemyopz.workflow.repository.WorkflowInstanceRepository;
import com.managemyopz.workflow.repository.ApprovalTaskRepository;
import com.managemyopz.workflow.entity.ApprovalTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.managemyopz.shared.event.EventPublisher;
import com.managemyopz.shared.event.WorkflowTransitionEvent;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalWorkflowServiceImpl implements ApprovalWorkflowService {

    private final WorkflowInstanceRepository instanceRepository;
    private final ApprovalTransactionRepository transactionRepository;
    private final ApprovalDelegationRepository delegationRepository;
    private final ApprovalMatrixRepository matrixRepository;
    private final EmployeeTwinRepository twinRepository;
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;
    private final ApprovalTaskRepository approvalTaskRepository;

    @Override
    public WorkflowInstance initiateWorkflow(String entityType, UUID entityId, UUID employeeId, String initiatorUsername) {
        log.info("Initiating workflow for {} request {} by employee {}", entityType, entityId, employeeId);
        
        EmployeeTwin emp = twinRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee twin not found for ID: " + employeeId));

        String tenant = TenantContext.getCurrentTenant();
        ApprovalMatrix matrix = findMatchingMatrix(tenant, entityType, emp);

        WorkflowInstance instance = new WorkflowInstance();
        instance.setTenantId(tenant);
        instance.setEntityType(entityType);
        instance.setEntityId(entityId);
        instance.setInitiatedBy(initiatorUsername);
        instance.setStartedAt(Instant.now());
        instance.setStatus(WorkflowStatus.PENDING);
        instance.setCurrentStepOrder(1);

        if (matrix != null) {
            instance.setCreatedBy(matrix.getId().toString()); // Relate to matrix ID
        }

        WorkflowInstance savedInstance = instanceRepository.save(instance);

        // Record submission transaction
        ApprovalTransaction submissionTx = ApprovalTransaction.builder()
                .matrixId(matrix != null ? matrix.getId() : null)
                .workflowInstanceId(savedInstance.getId())
                .entityType(entityType)
                .entityId(entityId)
                .levelNumber(0)
                .actedBy(initiatorUsername)
                .action("SUBMITTED")
                .comments("Request submitted for approval")
                .actedAt(Instant.now())
                .build();
        submissionTx.setTenantId(tenant);
        transactionRepository.save(submissionTx);

        // Resolve current state
        checkWorkflowCompletionOrRouting(savedInstance, matrix, emp);

        savedInstance = instanceRepository.save(savedInstance);

        // Publish event for status change
        eventPublisher.publish(new WorkflowTransitionEvent(
                tenant, initiatorUsername, savedInstance.getId(),
                entityType, entityId, savedInstance.getStatus().name(),
                savedInstance.getCurrentStepOrder(), initiatorUsername, "SUBMITTED", "Request submitted for approval"
        ));

        syncApprovalTasks(savedInstance, matrix);

        return savedInstance;
    }

    @Override
    public WorkflowInstance processAction(String entityType, UUID entityId, String actorUsername, String action, String comments, String ipAddress) {
        log.info("Processing action {} by {} on {} request {}", action, actorUsername, entityType, entityId);
        
        WorkflowInstance instance = instanceRepository.findByEntityTypeAndEntityIdAndDeletedFalse(entityType, entityId)
                .orElseThrow(() -> new IllegalArgumentException("No active workflow instance found for request " + entityId));

        if (instance.getStatus() != WorkflowStatus.PENDING && instance.getStatus() != WorkflowStatus.IN_PROGRESS) {
            throw new IllegalStateException("Workflow is already in final state: " + instance.getStatus());
        }

        UUID matrixId = null;
        if (instance.getCreatedBy() != null) {
            try {
                matrixId = UUID.fromString(instance.getCreatedBy());
            } catch (Exception ignored) {}
        }

        ApprovalMatrix matrix = matrixId != null ? matrixRepository.findByIdAndDeletedFalse(matrixId).orElse(null) : null;
        
        // Find current approver to validate permissions
        String expectedApprover = resolveCurrentApprover(instance, matrix);
        if (expectedApprover == null || !expectedApprover.equalsIgnoreCase(actorUsername)) {
            throw new SecurityException("User '" + actorUsername + "' is not the authorized approver at this level. Expected: '" + expectedApprover + "'");
        }

        // Record transaction
        ApprovalTransaction tx = ApprovalTransaction.builder()
                .matrixId(matrixId)
                .workflowInstanceId(instance.getId())
                .entityType(entityType)
                .entityId(entityId)
                .levelNumber(instance.getCurrentStepOrder())
                .actedBy(actorUsername)
                .action(action)
                .comments(comments)
                .ipAddress(ipAddress)
                .actedAt(Instant.now())
                .build();
        tx.setTenantId(instance.getTenantId());
        transactionRepository.save(tx);

        if ("REJECTED".equalsIgnoreCase(action)) {
            instance.setStatus(WorkflowStatus.REJECTED);
            instance.setCompletedAt(Instant.now());
        } else if ("APPROVED".equalsIgnoreCase(action)) {
            instance.setCurrentStepOrder(instance.getCurrentStepOrder() + 1);
            // Re-resolve completion
            EmployeeTwin emp = twinRepository.findByWorkEmail(instance.getInitiatedBy())
                    .orElse(null);
            if (emp == null) {
                // Try username
                emp = twinRepository.findByEmployeeCode(instance.getInitiatedBy().toUpperCase())
                        .orElse(null);
            }
            checkWorkflowCompletionOrRouting(instance, matrix, emp);
        } else if ("CANCELLED".equalsIgnoreCase(action)) {
            instance.setStatus(WorkflowStatus.CANCELLED);
            instance.setCompletedAt(Instant.now());
        }

        WorkflowInstance savedInstance = instanceRepository.save(instance);

        // Publish event for status change
        eventPublisher.publish(new WorkflowTransitionEvent(
                savedInstance.getTenantId(), actorUsername, savedInstance.getId(),
                entityType, entityId, savedInstance.getStatus().name(),
                savedInstance.getCurrentStepOrder(), actorUsername, action, comments
        ));

        syncApprovalTasks(savedInstance, matrix);

        return savedInstance;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowInstance> getPendingApprovals(String actorUsername) {
        List<WorkflowInstance> allPending = instanceRepository.findAll();
        List<WorkflowInstance> result = new ArrayList<>();

        for (WorkflowInstance instance : allPending) {
            if (instance.getStatus() == WorkflowStatus.PENDING || instance.getStatus() == WorkflowStatus.IN_PROGRESS) {
                UUID matrixId = null;
                if (instance.getCreatedBy() != null) {
                    try {
                        matrixId = UUID.fromString(instance.getCreatedBy());
                    } catch (Exception ignored) {}
                }
                ApprovalMatrix matrix = matrixId != null ? matrixRepository.findByIdAndDeletedFalse(matrixId).orElse(null) : null;
                String currentApprover = resolveCurrentApprover(instance, matrix);
                if (currentApprover != null && currentApprover.equalsIgnoreCase(actorUsername)) {
                    result.add(instance);
                }
            }
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalTransaction> getHistory(String entityType, UUID entityId) {
        return transactionRepository.findByEntityTypeAndEntityIdOrderByActedAtAsc(entityType, entityId);
    }

    @Override
    public ApprovalDelegation createDelegation(UUID fromEmployeeId, UUID toEmployeeId, LocalDate startDate, LocalDate endDate) {
        ApprovalDelegation delegation = ApprovalDelegation.builder()
                .fromEmployeeId(fromEmployeeId)
                .toEmployeeId(toEmployeeId)
                .startDate(startDate)
                .endDate(endDate)
                .active(true)
                .build();
        delegation.setTenantId(TenantContext.getCurrentTenant());
        return delegationRepository.save(delegation);
    }

    @Override
    @Transactional(readOnly = true)
    public String resolveCurrentApprover(String entityType, UUID entityId) {
        WorkflowInstance instance = instanceRepository.findByEntityTypeAndEntityIdAndDeletedFalse(entityType, entityId)
                .orElse(null);
        if (instance == null || (instance.getStatus() != WorkflowStatus.PENDING && instance.getStatus() != WorkflowStatus.IN_PROGRESS)) {
            return null;
        }
        UUID matrixId = null;
        if (instance.getCreatedBy() != null) {
            try {
                matrixId = UUID.fromString(instance.getCreatedBy());
            } catch (Exception ignored) {}
        }
        ApprovalMatrix matrix = matrixId != null ? matrixRepository.findByIdAndDeletedFalse(matrixId).orElse(null) : null;
        return resolveCurrentApprover(instance, matrix);
    }

    private String resolveCurrentApprover(WorkflowInstance instance, ApprovalMatrix matrix) {
        if (matrix == null) {
            return "admin@managemyopz.com"; // Fallback default
        }

        EmployeeTwin emp = twinRepository.findByWorkEmail(instance.getInitiatedBy())
                .orElse(null);
        if (emp == null) {
            emp = twinRepository.findByEmployeeCode(instance.getInitiatedBy().toUpperCase())
                    .orElse(null);
        }

        if (emp == null) {
            return "admin@managemyopz.com";
        }

        int currentLvl = instance.getCurrentStepOrder();
        String appType = null;
        UUID configApproverId = null;

        // Check level
        if (matrix.getLevels() != null && !matrix.getLevels().isEmpty()) {
            ApprovalMatrixLevel level = matrix.getLevels().stream()
                    .filter(l -> l.getLevelNumber() == currentLvl)
                    .findFirst().orElse(null);
            if (level != null) {
                appType = level.getApproverType();
                configApproverId = level.getApproverEmployeeId();
            }
        } else {
            // Flat columns compatibility fallback
            if (currentLvl == 1) {
                appType = matrix.getApproverLevel1Type();
                configApproverId = matrix.getApproverLevel1Id();
            } else if (currentLvl == 2) {
                appType = matrix.getApproverLevel2Type();
                configApproverId = matrix.getApproverLevel2Id();
            } else if (currentLvl == 3) {
                appType = matrix.getApproverLevel3Type();
                configApproverId = matrix.getApproverLevel3Id();
            } else if (currentLvl == 4) {
                appType = matrix.getApproverLevel4Type();
                configApproverId = matrix.getApproverLevel4Id();
            }
        }

        if (appType == null) {
            return null;
        }

        String resolvedEmail = resolveApproverEmail(emp, appType, configApproverId);
        if (resolvedEmail == null) {
            return "admin@managemyopz.com";
        }

        // Apply delegation if active
        EmployeeTwin approverTwin = twinRepository.findByWorkEmail(resolvedEmail).orElse(null);
        if (approverTwin != null) {
            List<ApprovalDelegation> delegations = delegationRepository.findActiveDelegation(approverTwin.getId(), LocalDate.now());
            if (!delegations.isEmpty()) {
                UUID delegateId = delegations.get(0).getToEmployeeId();
                EmployeeTwin delegateTwin = twinRepository.findById(delegateId).orElse(null);
                if (delegateTwin != null) {
                    log.info("Approval delegated from {} to {}", resolvedEmail, delegateTwin.getWorkEmail());
                    return delegateTwin.getWorkEmail();
                }
            }
        }

        return resolvedEmail;
    }

    private void checkWorkflowCompletionOrRouting(WorkflowInstance instance, ApprovalMatrix matrix, EmployeeTwin emp) {
        int currentLvl = instance.getCurrentStepOrder();
        int maxLvl = 0;

        if (matrix != null) {
            if (matrix.getLevels() != null && !matrix.getLevels().isEmpty()) {
                maxLvl = matrix.getLevels().stream()
                        .mapToInt(ApprovalMatrixLevel::getLevelNumber)
                        .max().orElse(0);
            } else {
                // Fallback flat levels check
                if (matrix.getApproverLevel4Type() != null) maxLvl = 4;
                else if (matrix.getApproverLevel3Type() != null) maxLvl = 3;
                else if (matrix.getApproverLevel2Type() != null) maxLvl = 2;
                else if (matrix.getApproverLevel1Type() != null) maxLvl = 1;
            }
        }

        if (currentLvl > maxLvl || maxLvl == 0) {
            instance.setStatus(WorkflowStatus.APPROVED);
            instance.setCompletedAt(Instant.now());
        } else {
            instance.setStatus(WorkflowStatus.IN_PROGRESS);
        }
    }

    private String resolveApproverEmail(EmployeeTwin employee, String approverType, UUID configApproverId) {
        if ("SPECIFIC_USER".equalsIgnoreCase(approverType) && configApproverId != null) {
            return twinRepository.findById(configApproverId)
                    .map(EmployeeTwin::getWorkEmail).orElse(null);
        } else if ("REPORTING_MANAGER".equalsIgnoreCase(approverType)) {
            if (employee.getManagerId() != null) {
                return twinRepository.findById(employee.getManagerId())
                        .map(EmployeeTwin::getWorkEmail).orElse(null);
            }
        } else if ("SKIP_MANAGER".equalsIgnoreCase(approverType)) {
            if (employee.getSkipManagerId() != null) {
                return twinRepository.findById(employee.getSkipManagerId())
                        .map(EmployeeTwin::getWorkEmail).orElse(null);
            }
        } else if ("DEPARTMENT_HEAD".equalsIgnoreCase(approverType)) {
            if (employee.getDepartmentHeadId() != null) {
                return twinRepository.findById(employee.getDepartmentHeadId())
                        .map(EmployeeTwin::getWorkEmail).orElse(null);
            }
        } else if ("HRBP".equalsIgnoreCase(approverType)) {
            if (employee.getHrbpId() != null) {
                return twinRepository.findById(employee.getHrbpId())
                        .map(EmployeeTwin::getWorkEmail).orElse(null);
            }
        }
        return "admin@managemyopz.com"; // Default fallback
    }

    private ApprovalMatrix findMatchingMatrix(String tenantId, String approvalType, EmployeeTwin emp) {
        List<ApprovalMatrix> matrices = matrixRepository.findByTenantIdAndDeletedFalse(tenantId);
        
        ApprovalMatrix bestMatch = null;
        int bestScore = -1;
        int bestPriority = -1;

        for (ApprovalMatrix matrix : matrices) {
            if (!matrix.isActive() || !approvalType.equalsIgnoreCase(matrix.getApprovalType())) {
                continue;
            }

            boolean matches = true;
            int score = 0;

            if (matrix.getOrganizationId() != null) {
                if (emp.getOrganizationId() == null || !matrix.getOrganizationId().equals(emp.getOrganizationId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getBusinessUnitId() != null) {
                if (emp.getBusinessUnitId() == null || !matrix.getBusinessUnitId().equals(emp.getBusinessUnitId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getDivisionId() != null) {
                if (emp.getDivisionId() == null || !matrix.getDivisionId().equals(emp.getDivisionId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getDepartmentId() != null) {
                if (emp.getDepartmentId() == null || !matrix.getDepartmentId().equals(emp.getDepartmentId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getTeamId() != null) {
                // Treat subDepartmentId as teamId
                if (emp.getSubDepartmentId() == null || !matrix.getTeamId().equals(emp.getSubDepartmentId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getDesignationId() != null) {
                if (emp.getDesignationId() == null || !matrix.getDesignationId().equals(emp.getDesignationId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getGradeId() != null) {
                if (emp.getGradeId() == null || !matrix.getGradeId().equals(emp.getGradeId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getBandId() != null) {
                if (emp.getBandId() == null || !matrix.getBandId().equals(emp.getBandId())) {
                    matches = false;
                } else {
                    score++;
                }
            }
            if (matrix.getEmploymentTypeId() != null) {
                if (emp.getEmploymentTypeId() == null || !matrix.getEmploymentTypeId().equals(emp.getEmploymentTypeId())) {
                    matches = false;
                } else {
                    score++;
                }
            }

            if (matches) {
                int priority = matrix.getPriority() != null ? matrix.getPriority() : 0;
                if (score > bestScore) {
                    bestScore = score;
                    bestPriority = priority;
                    bestMatch = matrix;
                } else if (score == bestScore && priority > bestPriority) {
                    bestPriority = priority;
                    bestMatch = matrix;
                }
            }
        }

        return bestMatch;
    }

    private void syncApprovalTasks(WorkflowInstance instance, ApprovalMatrix matrix) {
        try {
            List<ApprovalTask> pendingTasks = approvalTaskRepository.findByWorkflowInstanceIdAndActionStatusAndDeletedFalse(instance.getId(), "PENDING");
            
            if (instance.getStatus() != WorkflowStatus.PENDING && instance.getStatus() != WorkflowStatus.IN_PROGRESS) {
                // Complete all pending tasks
                for (ApprovalTask task : pendingTasks) {
                    task.setActionStatus(instance.getStatus().name());
                    task.setComments("Workflow complete: " + instance.getStatus().name());
                    approvalTaskRepository.save(task);
                }
            } else {
                String approverEmail = resolveCurrentApprover(instance, matrix);
                if (approverEmail != null) {
                    EmployeeTwin approverTwin = twinRepository.findByWorkEmail(approverEmail).orElse(null);
                    if (approverTwin != null) {
                        final UUID approverId = approverTwin.getId();
                        final int currentLvl = instance.getCurrentStepOrder();
                        // Mark other pending tasks as archived
                        for (ApprovalTask task : pendingTasks) {
                            if (!task.getApproverEmployeeId().equals(approverId)) {
                                task.setActionStatus("ARCHIVED");
                                approvalTaskRepository.save(task);
                            }
                        }
                        
                        boolean exists = pendingTasks.stream()
                                .anyMatch(t -> t.getApproverEmployeeId().equals(approverId) && t.getLevelNo() == currentLvl);
                        
                        if (!exists) {
                            ApprovalTask newTask = new ApprovalTask();
                            newTask.setTenantId(instance.getTenantId());
                            newTask.setWorkflowInstanceId(instance.getId());
                            newTask.setModuleType(instance.getEntityType());
                            newTask.setRequestId(instance.getEntityId());
                            newTask.setApproverEmployeeId(approverTwin.getId());
                            newTask.setLevelNo(instance.getCurrentStepOrder());
                            newTask.setActionStatus("PENDING");
                            newTask.setAssignedAt(Instant.now());
                            newTask.setDueAt(Instant.now().plusSeconds(172800)); // SLA: 48 hours
                            
                            // Check active delegation
                            List<ApprovalDelegation> delegations = delegationRepository.findActiveDelegation(approverTwin.getId(), LocalDate.now());
                            if (!delegations.isEmpty()) {
                                newTask.setDelegatedTo(delegations.get(0).getToEmployeeId());
                                newTask.setActionStatus("DELEGATED");
                            }
                            approvalTaskRepository.save(newTask);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync approval tasks: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalTask> getTasksForUser(String username, String status) {
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return Collections.emptyList();
        }
        EmployeeTwin emp = twinRepository.findByWorkEmail(username)
                .orElse(null);
        if (emp == null) {
            emp = twinRepository.findByEmployeeCode(username.toUpperCase()).orElse(null);
        }
        if (emp == null) {
            return Collections.emptyList();
        }

        if (status == null || status.equalsIgnoreCase("ALL")) {
            return approvalTaskRepository.findActiveTasksForEmployee(emp.getId());
        } else {
            return approvalTaskRepository.findByApproverEmployeeIdAndActionStatusAndDeletedFalse(emp.getId(), status.toUpperCase());
        }
    }

    @Override
    public ApprovalTask processTaskAction(UUID taskId, String actorUsername, String action, String comments, String ipAddress) {
        final ApprovalTask task = approvalTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found for ID: " + taskId));

        final UUID instanceId = task.getWorkflowInstanceId();
        // Process the workflow instance update
        WorkflowInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow instance not found for ID: " + instanceId));

        processAction(instance.getEntityType(), instance.getEntityId(), actorUsername, action, comments, ipAddress);

        // Fetch task again as it was updated by syncApprovalTasks or update it here
        return approvalTaskRepository.findById(taskId).orElse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public com.managemyopz.workflow.dto.WorkflowPreviewDto previewWorkflow(String entityType, UUID employeeId) {
        log.info("Previewing workflow for {} request by employee {}", entityType, employeeId);
        
        EmployeeTwin emp = twinRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee twin not found for ID: " + employeeId));

        String tenant = TenantContext.getCurrentTenant();
        ApprovalMatrix matrix = findMatchingMatrix(tenant, entityType, emp);

        List<com.managemyopz.workflow.dto.WorkflowPreviewDto.ApproverStepDto> steps = new ArrayList<>();
        
        if (matrix != null) {
            if (matrix.getLevels() != null && !matrix.getLevels().isEmpty()) {
                for (ApprovalMatrixLevel level : matrix.getLevels()) {
                    String approverEmail = resolveApproverEmail(emp, level.getApproverType(), level.getApproverEmployeeId());
                    String approverName = "";
                    if (approverEmail != null) {
                        approverName = twinRepository.findByWorkEmail(approverEmail)
                                .map(t -> t.getFirstName() + " " + t.getLastName())
                                .orElse(approverEmail);
                    }
                    steps.add(com.managemyopz.workflow.dto.WorkflowPreviewDto.ApproverStepDto.builder()
                            .levelNumber(level.getLevelNumber())
                            .approverType(level.getApproverType())
                            .approverEmail(approverEmail)
                            .approverName(approverName)
                            .build());
                }
            } else {
                // Fallback flat columns check
                int levelIdx = 1;
                String[] types = {
                    matrix.getApproverLevel1Type(),
                    matrix.getApproverLevel2Type(),
                    matrix.getApproverLevel3Type(),
                    matrix.getApproverLevel4Type()
                };
                UUID[] ids = {
                    matrix.getApproverLevel1Id(),
                    matrix.getApproverLevel2Id(),
                    matrix.getApproverLevel3Id(),
                    matrix.getApproverLevel4Id()
                };
                for (int i = 0; i < 4; i++) {
                    if (types[i] != null) {
                        String approverEmail = resolveApproverEmail(emp, types[i], ids[i]);
                        String approverName = "";
                        if (approverEmail != null) {
                            approverName = twinRepository.findByWorkEmail(approverEmail)
                                    .map(t -> t.getFirstName() + " " + t.getLastName())
                                    .orElse(approverEmail);
                        }
                        steps.add(com.managemyopz.workflow.dto.WorkflowPreviewDto.ApproverStepDto.builder()
                                .levelNumber(levelIdx++)
                                .approverType(types[i])
                                .approverEmail(approverEmail)
                                .approverName(approverName)
                                .build());
                    }
                }
            }
        }

        // Default fallback if no approvers are resolved
        if (steps.isEmpty()) {
            String defaultApprover = "admin@managemyopz.com";
            steps.add(com.managemyopz.workflow.dto.WorkflowPreviewDto.ApproverStepDto.builder()
                    .levelNumber(1)
                    .approverType("SPECIFIC_USER")
                    .approverEmail(defaultApprover)
                    .approverName("System Administrator")
                    .build());
        }

        // Escalation path: Reporting Manager or Skip Manager
        String escalationPath = "Reporting Manager";
        if (emp.getSkipManagerId() != null) {
            escalationPath = twinRepository.findById(emp.getSkipManagerId())
                    .map(t -> "Skip Manager: " + t.getFirstName() + " " + t.getLastName())
                    .orElse("Skip Manager");
        } else if (emp.getManagerId() != null) {
            escalationPath = twinRepository.findById(emp.getManagerId())
                    .map(t -> "Reporting Manager: " + t.getFirstName() + " " + t.getLastName())
                    .orElse("Reporting Manager");
        }

        return com.managemyopz.workflow.dto.WorkflowPreviewDto.builder()
                .approvalType(entityType)
                .steps(steps)
                .totalSteps(steps.size())
                .escalationPath(escalationPath)
                .slaHours("72 Hours") // Standard SLA
                .build();
    }
}
