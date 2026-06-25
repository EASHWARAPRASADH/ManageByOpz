package com.managemyopz.twin.recruitment.service;

import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.orgdna.entity.Position;
import com.managemyopz.orgdna.repository.PositionRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.twin.recruitment.entity.*;
import com.managemyopz.twin.recruitment.repository.*;
import com.managemyopz.twin.service.EmployeeTwinService;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RecruitmentServiceImpl implements RecruitmentService {

    private final RequisitionRepository requisitionRepository;
    private final RequisitionApprovalRepository requisitionApprovalRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final CandidateDocumentRepository candidateDocumentRepository;
    private final CandidateNoteRepository candidateNoteRepository;
    private final CandidateActivityRepository candidateActivityRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final OfferRepository offerRepository;
    private final OfferApprovalRepository offerApprovalRepository;
    private final TalentPoolRepository talentPoolRepository;
    private final RecruitmentAnalyticsRepository recruitmentAnalyticsRepository;

    private final PositionRepository positionRepository;
    private final EmployeeTwinService employeeTwinService;
    private final AuditService auditService;
    private final RecruitmentConfigService recruitmentConfigService;
    private final EmployeeTwinRepository employeeTwinRepository;

    private final RequisitionApprovalStepRepository requisitionApprovalStepRepository;
    private final RequisitionAttachmentRepository requisitionAttachmentRepository;
    private final RequisitionCommentRepository requisitionCommentRepository;
    private final RequisitionActivityLogRepository requisitionActivityLogRepository;
    private final RequisitionCustomFieldRepository requisitionCustomFieldRepository;
    private final RequisitionCustomValueRepository requisitionCustomValueRepository;
    private final RequisitionDraftRepository requisitionDraftRepository;
    private final RequisitionBudgetAnalysisRepository requisitionBudgetAnalysisRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final com.managemyopz.notification.service.NotificationService notificationService;

    private void recordAudit(String entityType, String entityId, AuditAction action, String summary) {
        try {
            String tenant = TenantContext.getCurrentTenant();
            String user = TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system";
            auditService.recordAudit(
                tenant != null ? tenant : "default",
                "RECRUITMENT",
                entityType,
                entityId,
                action,
                null,
                null,
                UUID.randomUUID().toString(),
                user,
                summary
            );
        } catch (Exception e) {
            log.error("Failed to write recruitment audit log for {} : {}", entityType, entityId, e);
        }
    }

    // ── Requisitions ──────────────────────────────────────────
    @Override
    public Requisition createRequisition(Requisition req) {
        req.setTenantId(TenantContext.getCurrentTenant());
        req.setDeleted(false);
        req.setStatus("DRAFT");
        // Auto-generate req number if not provided
        if (req.getReqNumber() == null || req.getReqNumber().isBlank()) {
            req.setReqNumber("REQ-" + System.currentTimeMillis() % 1000000);
        }
        Requisition saved = requisitionRepository.save(req);
        recordAudit("Requisition", saved.getId().toString(), AuditAction.CREATE, "Created manpower requisition " + saved.getReqNumber());
        return saved;
    }

    @Override
    public Requisition updateRequisition(UUID id, Requisition req) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition existing = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
        
        existing.setTitle(req.getTitle());
        existing.setDepartment(req.getDepartment());
        existing.setBusinessUnit(req.getBusinessUnit());
        existing.setLocation(req.getLocation());
        existing.setDesignation(req.getDesignation());
        existing.setGrade(req.getGrade());
        existing.setBand(req.getBand());
        existing.setEmploymentType(req.getEmploymentType());
        existing.setVacancies(req.getVacancies());
        existing.setBudget(req.getBudget());
        existing.setHiringReason(req.getHiringReason());
        existing.setExpectedJoiningDate(req.getExpectedJoiningDate());
        existing.setPriority(req.getPriority());
        
        Requisition saved = requisitionRepository.save(existing);
        recordAudit("Requisition", saved.getId().toString(), AuditAction.UPDATE, "Updated manpower requisition " + saved.getReqNumber());
        return saved;
    }

    @Override
    public List<Requisition> getRequisitions() {
        return requisitionRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    public Requisition getRequisition(UUID id) {
        return requisitionRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
    }

    @Override
    public Requisition submitRequisition(UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition existing = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
        
        existing.setStatus("PENDING_APPROVAL");
        Requisition saved = requisitionRepository.save(existing);

        // Fetch active Requisition workflow definition
        List<WorkflowDefinition> wfDefs = workflowDefinitionRepository.findByTenantIdAndDeletedFalse(tenantId);
        WorkflowDefinition reqWf = wfDefs.stream()
                .filter(w -> "REQUISITION".equalsIgnoreCase(w.getWorkflowType()) && w.getActive())
                .findFirst()
                .orElse(null);

        List<WorkflowStep> wfSteps = null;
        if (reqWf != null) {
            wfSteps = workflowStepRepository.findByTenantIdAndWorkflowDefinitionIdAndDeletedFalseOrderByStepOrderAsc(tenantId, reqWf.getId());
        }

        // Delete existing approval steps if resubmitted
        List<RequisitionApprovalStep> existingSteps = requisitionApprovalStepRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepOrderAsc(id, tenantId);
        if (!existingSteps.isEmpty()) {
            requisitionApprovalStepRepository.deleteAll(existingSteps);
        }

        if (wfSteps != null && !wfSteps.isEmpty()) {
            for (WorkflowStep ws : wfSteps) {
                RequisitionApprovalStep step = new RequisitionApprovalStep();
                step.setRequisition(saved);
                step.setTenantId(tenantId);
                step.setDeleted(false);
                step.setStepName(ws.getStepName());
                step.setStepOrder(ws.getStepOrder());
                step.setApproverRole(ws.getApproverRole());
                step.setStatus("PENDING");
                requisitionApprovalStepRepository.save(step);
            }
        } else {
            // Fallback: 1 default step
            RequisitionApprovalStep step = new RequisitionApprovalStep();
            step.setRequisition(saved);
            step.setTenantId(tenantId);
            step.setDeleted(false);
            step.setStepName("Direct Department Head sign-off");
            step.setStepOrder(1);
            step.setApproverRole("ROLE_LINE_MANAGER");
            step.setStatus("PENDING");
            requisitionApprovalStepRepository.save(step);
        }

        // Send Notification
        try {
            notificationService.sendEmail(
                "hr-approvals@managemyopz.com",
                "Manpower Requisition Submitted - " + saved.getReqNumber(),
                "A new manpower requisition (" + saved.getTitle() + ") has been submitted for approval by " + 
                (TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "System")
            );
        } catch (Exception ex) {
            log.warn("Failed to send submission email notification: {}", ex.getMessage());
        }

        // Log Activity
        logActivity(saved, "SUBMIT", "Requisition submitted for approval");
        recordAudit("Requisition", saved.getId().toString(), AuditAction.UPDATE, "Submitted requisition " + saved.getReqNumber() + " for approval");
        return saved;
    }

    @Override
    public Requisition approveRequisition(UUID id, UUID approverId, String comments) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));

        List<RequisitionApprovalStep> steps = requisitionApprovalStepRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepOrderAsc(id, tenantId);
        RequisitionApprovalStep currentPending = null;
        boolean hasMorePending = false;

        for (RequisitionApprovalStep step : steps) {
            if ("PENDING".equals(step.getStatus())) {
                if (currentPending == null) {
                    currentPending = step;
                } else {
                    hasMorePending = true;
                }
            }
        }

        if (currentPending != null) {
            currentPending.setStatus("APPROVED");
            currentPending.setComments(comments);
            currentPending.setApproverName(TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "Approver");
            currentPending.setUpdatedAt(java.time.Instant.now());
            requisitionApprovalStepRepository.save(currentPending);
            logActivity(req, "APPROVE", "Step '" + currentPending.getStepName() + "' approved. Comments: " + comments);
        }

        if (!hasMorePending) {
            // Requisition is fully approved!
            req.setStatus("APPROVED");
            Requisition saved = requisitionRepository.save(req);

            // Trigger Automatic Position Generation
            Position pos = new Position();
            pos.setTenantId(tenantId);
            pos.setDeleted(false);
            pos.setTitle(req.getTitle());
            pos.setStatus("ACTIVE");
            pos.setBudgeted(true);
            pos.setVacant(true);
            pos.setFilled(false);
            
            // Map Org DNA values from Requisition if they are valid UUID strings
            if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
                try {
                    pos.setDepartmentId(UUID.fromString(req.getDepartment().trim()));
                } catch (IllegalArgumentException e) {
                    log.warn("Requisition department '{}' is not a valid UUID", req.getDepartment());
                }
            }
            if (req.getGrade() != null && !req.getGrade().isBlank()) {
                try {
                    pos.setGradeId(UUID.fromString(req.getGrade().trim()));
                } catch (IllegalArgumentException e) {
                    log.warn("Requisition grade '{}' is not a valid UUID", req.getGrade());
                }
            }
            if (req.getBand() != null && !req.getBand().isBlank()) {
                try {
                    pos.setBandId(UUID.fromString(req.getBand().trim()));
                } catch (IllegalArgumentException e) {
                    log.warn("Requisition band '{}' is not a valid UUID", req.getBand());
                }
            }
            if (req.getLocation() != null && !req.getLocation().isBlank()) {
                try {
                    pos.setLocationId(UUID.fromString(req.getLocation().trim()));
                } catch (IllegalArgumentException e) {
                    log.warn("Requisition location '{}' is not a valid UUID", req.getLocation());
                }
            }
            
            Position savedPos = positionRepository.save(pos);
            logActivity(saved, "SYSTEM_INTEGRATION", "Position " + savedPos.getId() + " auto-generated from approved Requisition (Inherited Org DNA mappings: Department=" + pos.getDepartmentId() + ", Grade=" + pos.getGradeId() + ", Band=" + pos.getBandId() + ", Location=" + pos.getLocationId() + ")");

            // Send notification
            try {
                notificationService.sendEmail(
                    "recruitment-team@managemyopz.com",
                    "Requisition Fully Approved & Position Created - " + saved.getReqNumber(),
                    "Requisition " + saved.getReqNumber() + " has been fully approved. Position " + savedPos.getId() + " has been created."
                );
            } catch (Exception ex) {
                log.warn("Failed to send approval email notification: {}", ex.getMessage());
            }

            recordAudit("Requisition", saved.getId().toString(), AuditAction.APPROVE, "Approved requisition " + saved.getReqNumber());
            return saved;
        } else {
            // Still pending subsequent approval stages
            req.setStatus("PENDING_APPROVAL");
            Requisition saved = requisitionRepository.save(req);
            
            // Notify next step
            try {
                notificationService.sendEmail(
                    "hr-approvals@managemyopz.com",
                    "Action Required: Requisition Approval Step Pending",
                    "Requisition " + req.getReqNumber() + " has passed a step and is pending subsequent verification."
                );
            } catch (Exception ex) {
                log.warn("Failed to send pending step notification: {}", ex.getMessage());
            }

            return saved;
        }
    }

    @Override
    public Requisition rejectRequisition(UUID id, UUID approverId, String comments) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));

        List<RequisitionApprovalStep> steps = requisitionApprovalStepRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepOrderAsc(id, tenantId);
        for (RequisitionApprovalStep step : steps) {
            if ("PENDING".equals(step.getStatus())) {
                step.setStatus("REJECTED");
                step.setComments(comments);
                step.setApproverName(TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "Approver");
                step.setUpdatedAt(java.time.Instant.now());
                requisitionApprovalStepRepository.save(step);
                break;
            }
        }

        req.setStatus("REJECTED");
        Requisition saved = requisitionRepository.save(req);

        // Send notification
        try {
            notificationService.sendEmail(
                "creator@managemyopz.com",
                "Requisition Rejected - " + saved.getReqNumber(),
                "Requisition " + saved.getReqNumber() + " has been rejected. Comments: " + comments
            );
        } catch (Exception ex) {
            log.warn("Failed to send rejection email notification: {}", ex.getMessage());
        }

        logActivity(saved, "REJECT", "Requisition rejected. Comments: " + comments);
        recordAudit("Requisition", saved.getId().toString(), AuditAction.REJECT, "Rejected requisition " + saved.getReqNumber());
        return saved;
    }

    // ── Job Postings ──────────────────────────────────────────
    @Override
    public JobPosting createJobPosting(JobPosting posting) {
        posting.setTenantId(TenantContext.getCurrentTenant());
        posting.setDeleted(false);
        if (posting.getStatus() == null) {
            posting.setStatus("DRAFT");
        }
        if (posting.getPosition() != null && posting.getPosition().getId() != null) {
            Position pos = positionRepository.findByIdAndDeletedFalse(posting.getPosition().getId())
                    .orElseThrow(() -> new PlatformException("Position not found", HttpStatus.NOT_FOUND, "POSITION_NOT_FOUND"));
            posting.setPosition(pos);
        }
        JobPosting saved = jobPostingRepository.save(posting);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.CREATE, "Created Job Posting: " + saved.getJobTitle());
        return saved;
    }

    @Override
    public JobPosting updateJobPosting(UUID id, JobPosting posting) {
        String tenantId = TenantContext.getCurrentTenant();
        JobPosting existing = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));
        
        existing.setJobTitle(posting.getJobTitle());
        existing.setJobDescription(posting.getJobDescription());
        existing.setSkills(posting.getSkills());
        existing.setLocation(posting.getLocation());
        existing.setEmploymentType(posting.getEmploymentType());
        existing.setSalaryRange(posting.getSalaryRange());
        existing.setExperience(posting.getExperience());
        existing.setApplicationDeadline(posting.getApplicationDeadline());
        existing.setStatus(posting.getStatus());
        
        JobPosting saved = jobPostingRepository.save(existing);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.UPDATE, "Updated Job Posting: " + saved.getJobTitle());
        return saved;
    }

    @Override
    public List<JobPosting> getJobPostings(String status) {
        String tenantId = TenantContext.getCurrentTenant();
        if (status != null && !status.isBlank()) {
            return jobPostingRepository.findByTenantIdAndStatusAndDeletedFalse(tenantId, status);
        }
        return jobPostingRepository.findByTenantIdAndDeletedFalse(tenantId);
    }

    @Override
    public JobPosting getJobPosting(UUID id) {
        return jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));
    }

    @Override
    public JobPosting changeJobPostingStatus(UUID id, String status) {
        String tenantId = TenantContext.getCurrentTenant();
        JobPosting posting = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));
        posting.setStatus(status);
        JobPosting saved = jobPostingRepository.save(posting);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.UPDATE, "Changed Job Posting status to " + status);
        return saved;
    }

    @Override
    public JobPosting activateJob(UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        JobPosting posting = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));

        if (posting.getJobTitle() == null || posting.getJobTitle().isBlank()) {
            throw new PlatformException("Job title is required for activation", HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
        }
        if (posting.getJobDescription() == null || posting.getJobDescription().isBlank()) {
            throw new PlatformException("Job description is required for activation", HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
        }
        if (posting.getSkills() == null || posting.getSkills().isBlank()) {
            throw new PlatformException("Skills are required for activation", HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
        }
        if (posting.getLocation() == null || posting.getLocation().isBlank()) {
            throw new PlatformException("Location is required for activation", HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
        }

        posting.setStatus("PUBLISHED");
        JobPosting saved = jobPostingRepository.save(posting);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.UPDATE, "Activated Job Posting: " + saved.getJobTitle());
        return saved;
    }

    @Override
    public JobPosting duplicateJob(UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        JobPosting existing = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));

        JobPosting duplicate = new JobPosting();
        duplicate.setTenantId(tenantId);
        duplicate.setDeleted(false);
        duplicate.setJobTitle("Copy of " + existing.getJobTitle());
        duplicate.setJobDescription(existing.getJobDescription());
        duplicate.setSkills(existing.getSkills());
        duplicate.setLocation(existing.getLocation());
        duplicate.setEmploymentType(existing.getEmploymentType());
        duplicate.setSalaryRange(existing.getSalaryRange());
        duplicate.setExperience(existing.getExperience());
        duplicate.setApplicationDeadline(existing.getApplicationDeadline());
        duplicate.setPosition(existing.getPosition());
        duplicate.setStatus("DRAFT");

        JobPosting saved = jobPostingRepository.save(duplicate);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.CREATE, "Duplicated Job Posting: " + saved.getJobTitle());
        return saved;
    }

    @Override
    public JobPosting archiveJob(UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        JobPosting posting = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));

        posting.setStatus("ARCHIVED");
        JobPosting saved = jobPostingRepository.save(posting);
        recordAudit("JobPosting", saved.getId().toString(), AuditAction.UPDATE, "Archived Job Posting: " + saved.getJobTitle());
        return saved;
    }

    // ── Candidates ──────────────────────────────────────────
    @Override
    public Candidate createCandidate(Candidate candidate) {
        candidate.setTenantId(TenantContext.getCurrentTenant());
        candidate.setDeleted(false);
        candidate.setStatus("APPLIED");
        if (candidate.getJobPosting() != null && candidate.getJobPosting().getId() != null) {
            JobPosting jp = jobPostingRepository.findByIdAndTenantIdAndDeletedFalse(candidate.getJobPosting().getId(), TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new PlatformException("Job Posting not found", HttpStatus.NOT_FOUND, "JOB_NOT_FOUND"));
            candidate.setJobPosting(jp);
        }
        if (candidate.getCandidateCode() == null || candidate.getCandidateCode().isBlank()) {
            candidate.setCandidateCode("CAND-" + System.currentTimeMillis() % 1000000);
        }
        Candidate saved = candidateRepository.save(candidate);

        // Record initial activity
        CandidateActivity act = new CandidateActivity();
        act.setCandidate(saved);
        act.setTenantId(saved.getTenantId());
        act.setDeleted(false);
        act.setActivityType("APPLIED");
        act.setDescription("Candidate applied via Careers Portal");
        act.setNewValue("APPLIED");
        candidateActivityRepository.save(act);

        recordAudit("Candidate", saved.getId().toString(), AuditAction.CREATE, "Registered Candidate: " + saved.getFullName());

        try {
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("candidate_name", saved.getFullName());
            placeholders.put("email", saved.getEmail());
            recruitmentConfigService.triggerNotification("CANDIDATE_APPLIED", placeholders);
        } catch (Exception e) {
            log.error("Failed to trigger notification on candidate apply", e);
        }

        return saved;
    }

    @Override
    public Candidate updateCandidate(UUID id, Candidate candidate) {
        String tenantId = TenantContext.getCurrentTenant();
        Candidate existing = candidateRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));
        
        existing.setFullName(candidate.getFullName());
        existing.setEmail(candidate.getEmail());
        existing.setPhone(candidate.getPhone());
        existing.setLocation(candidate.getLocation());
        existing.setCurrentCompany(candidate.getCurrentCompany());
        existing.setCurrentDesignation(candidate.getCurrentDesignation());
        existing.setExperienceYears(candidate.getExperienceYears());
        existing.setCurrentSalary(candidate.getCurrentSalary());
        existing.setExpectedSalary(candidate.getExpectedSalary());
        existing.setNoticePeriodDays(candidate.getNoticePeriodDays());
        existing.setSource(candidate.getSource());
        existing.setSkills(candidate.getSkills());
        existing.setResumeUrl(candidate.getResumeUrl());
        
        Candidate saved = candidateRepository.save(existing);
        recordAudit("Candidate", saved.getId().toString(), AuditAction.UPDATE, "Updated Candidate Profile: " + saved.getFullName());
        return saved;
    }

    @Override
    public List<Candidate> getCandidates() {
        return candidateRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    public Candidate getCandidate(UUID id) {
        return candidateRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));
    }

    @Override
    public Candidate moveCandidateStage(UUID id, String status) {
        String tenantId = TenantContext.getCurrentTenant();
        Candidate candidate = candidateRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));

        String oldStatus = candidate.getStatus();
        candidate.setStatus(status);
        Candidate saved = candidateRepository.save(candidate);

        // Record stage transition activity
        CandidateActivity act = new CandidateActivity();
        act.setCandidate(saved);
        act.setTenantId(saved.getTenantId());
        act.setDeleted(false);
        act.setActivityType("STAGE_CHANGE");
        act.setDescription("Moved candidate pipeline status");
        act.setOldValue(oldStatus);
        act.setNewValue(status);
        candidateActivityRepository.save(act);

        recordAudit("Candidate", saved.getId().toString(), AuditAction.UPDATE, "Moved candidate " + saved.getFullName() + " stage to " + status);
        return saved;
    }

    @Override
    public CandidateNote addCandidateNote(UUID candidateId, String noteText, UUID authorId) {
        String tenantId = TenantContext.getCurrentTenant();
        Candidate candidate = candidateRepository.findByIdAndTenantIdAndDeletedFalse(candidateId, tenantId)
                .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));

        CandidateNote note = new CandidateNote();
        note.setCandidate(candidate);
        note.setTenantId(tenantId);
        note.setDeleted(false);
        note.setNoteText(noteText);
        note.setAuthorId(authorId);
        CandidateNote saved = candidateNoteRepository.save(note);
        
        recordAudit("CandidateNote", saved.getId().toString(), AuditAction.CREATE, "Added comment notes to candidate profile " + candidate.getFullName());
        return saved;
    }

    @Override
    public List<CandidateNote> getCandidateNotes(UUID candidateId) {
        return candidateNoteRepository.findByCandidateIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(candidateId, TenantContext.getCurrentTenant());
    }

    @Override
    public List<CandidateActivity> getCandidateActivities(UUID candidateId) {
        return candidateActivityRepository.findByCandidateIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(candidateId, TenantContext.getCurrentTenant());
    }

    // ── Interviews ──────────────────────────────────────────
    @Override
    public Interview scheduleInterview(Interview interview) {
        interview.setTenantId(TenantContext.getCurrentTenant());
        interview.setDeleted(false);
        interview.setStatus("SCHEDULED");
        if (interview.getCandidate() != null && interview.getCandidate().getId() != null) {
            Candidate cand = candidateRepository.findByIdAndTenantIdAndDeletedFalse(interview.getCandidate().getId(), TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));
            interview.setCandidate(cand);
        }
        Interview saved = interviewRepository.save(interview);
        
        // Log candidate activity
        CandidateActivity act = new CandidateActivity();
        act.setCandidate(saved.getCandidate());
        act.setTenantId(saved.getTenantId());
        act.setDeleted(false);
        act.setActivityType("INTERVIEW_SCHEDULED");
        act.setDescription("Scheduled interview round: " + saved.getInterviewType() + " at " + saved.getScheduledTime());
        act.setNewValue("SCHEDULED");
        candidateActivityRepository.save(act);

        recordAudit("Interview", saved.getId().toString(), AuditAction.CREATE, "Scheduled interview round for candidate " + saved.getCandidate().getFullName());
        return saved;
    }

    @Override
    public Interview updateInterview(UUID id, Interview interview) {
        String tenantId = TenantContext.getCurrentTenant();
        Interview existing = interviewRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Interview round not found", HttpStatus.NOT_FOUND, "INTERVIEW_NOT_FOUND"));

        existing.setInterviewType(interview.getInterviewType());
        existing.setScheduledTime(interview.getScheduledTime());
        existing.setInterviewerIds(interview.getInterviewerIds());
        existing.setStatus(interview.getStatus());
        
        Interview saved = interviewRepository.save(existing);
        recordAudit("Interview", saved.getId().toString(), AuditAction.UPDATE, "Updated interview schedule details");
        return saved;
    }

    @Override
    public List<Interview> getInterviews() {
        return interviewRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    public Interview getInterview(UUID id) {
        return interviewRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Interview not found", HttpStatus.NOT_FOUND, "INTERVIEW_NOT_FOUND"));
    }

    @Override
    public InterviewFeedback submitFeedback(UUID interviewId, InterviewFeedback feedback) {
        String tenantId = TenantContext.getCurrentTenant();
        Interview interview = interviewRepository.findByIdAndTenantIdAndDeletedFalse(interviewId, tenantId)
                .orElseThrow(() -> new PlatformException("Interview round not found", HttpStatus.NOT_FOUND, "INTERVIEW_NOT_FOUND"));

        feedback.setInterview(interview);
        feedback.setTenantId(tenantId);
        feedback.setDeleted(false);
        InterviewFeedback saved = interviewFeedbackRepository.save(feedback);

        recordAudit("InterviewFeedback", saved.getId().toString(), AuditAction.CREATE, "Submitted feedback scorecard recommendation " + feedback.getOverallRecommendation());
        return saved;
    }

    // ── Offers ──────────────────────────────────────────
    @Override
    public Offer createOffer(Offer offer) {
        offer.setTenantId(TenantContext.getCurrentTenant());
        offer.setDeleted(false);
        offer.setStatus("DRAFT");
        if (offer.getCandidate() != null && offer.getCandidate().getId() != null) {
            Candidate cand = candidateRepository.findByIdAndTenantIdAndDeletedFalse(offer.getCandidate().getId(), TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));
            offer.setCandidate(cand);
        }
        if (offer.getPosition() != null && offer.getPosition().getId() != null) {
            Position pos = positionRepository.findByIdAndDeletedFalse(offer.getPosition().getId())
                    .orElseThrow(() -> new PlatformException("Position not found", HttpStatus.NOT_FOUND, "POSITION_NOT_FOUND"));
            offer.setPosition(pos);
        }
        Offer saved = offerRepository.save(offer);
        recordAudit("Offer", saved.getId().toString(), AuditAction.CREATE, "Generated job offer for candidate " + saved.getCandidate().getFullName());
        return saved;
    }

    @Override
    public Offer updateOffer(UUID id, Offer offer) {
        String tenantId = TenantContext.getCurrentTenant();
        Offer existing = offerRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Offer not found", HttpStatus.NOT_FOUND, "OFFER_NOT_FOUND"));
        
        existing.setCtc(offer.getCtc());
        existing.setBonus(offer.getBonus());
        existing.setJoiningBonus(offer.getJoiningBonus());
        existing.setJoiningDate(offer.getJoiningDate());
        existing.setLocation(offer.getLocation());
        existing.setStatus(offer.getStatus());
        
        Offer saved = offerRepository.save(existing);
        recordAudit("Offer", saved.getId().toString(), AuditAction.UPDATE, "Updated job offer values");
        return saved;
    }

    @Override
    public List<Offer> getOffers() {
        return offerRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    public Offer getOffer(UUID id) {
        return offerRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Offer not found", HttpStatus.NOT_FOUND, "OFFER_NOT_FOUND"));
    }

    @Override
    public Offer approveOffer(UUID id, UUID approverId, String comments) {
        String tenantId = TenantContext.getCurrentTenant();
        Offer offer = offerRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Offer not found", HttpStatus.NOT_FOUND, "OFFER_NOT_FOUND"));

        offer.setStatus("RELEASED");
        Offer saved = offerRepository.save(offer);
        recordAudit("Offer", saved.getId().toString(), AuditAction.APPROVE, "Released offer package to candidate " + saved.getCandidate().getFullName());
        return saved;
    }

    @Override
    public Offer rejectOffer(UUID id, UUID approverId, String comments) {
        String tenantId = TenantContext.getCurrentTenant();
        Offer offer = offerRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Offer not found", HttpStatus.NOT_FOUND, "OFFER_NOT_FOUND"));

        offer.setStatus("REJECTED");
        Offer saved = offerRepository.save(offer);
        recordAudit("Offer", saved.getId().toString(), AuditAction.REJECT, "Rejected offer package");
        return saved;
    }

    @Override
    public Offer acceptOffer(UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        Offer offer = offerRepository.findByIdAndTenantIdAndDeletedFalse(id, tenantId)
                .orElseThrow(() -> new PlatformException("Offer not found", HttpStatus.NOT_FOUND, "OFFER_NOT_FOUND"));

        if ("ACCEPTED".equalsIgnoreCase(offer.getStatus())) {
            log.info("Offer {} is already in ACCEPTED status. Skipping duplicate conversion.", id);
            return offer;
        }

        Candidate candidate = offer.getCandidate();
        
        // Idempotency check: verify if an Employee Twin already exists with candidate's work email
        if (employeeTwinRepository.existsByWorkEmailGlobal(candidate.getEmail()) > 0) {
            log.info("Employee Twin with work email {} already exists. Updating statuses and skipping duplicate creation.", candidate.getEmail());
            
            offer.setStatus("ACCEPTED");
            Offer saved = offerRepository.save(offer);
            
            candidate.setStatus("ACCEPTED");
            candidateRepository.save(candidate);
            
            return saved;
        }

        offer.setStatus("ACCEPTED");
        Offer saved = offerRepository.save(offer);

        candidate.setStatus("ACCEPTED");
        candidateRepository.save(candidate);

        try {
            recruitmentConfigService.triggerAutomation("STAGE_CHANGE_OFFER_ACCEPTED", candidate.getId());
        } catch (Exception e) {
            log.error("Failed to trigger automation rule for STAGE_CHANGE_OFFER_ACCEPTED", e);
        }

        // ── Candidate to Employee Digital Twin Conversion ──
        if (employeeTwinRepository.existsByWorkEmailGlobal(candidate.getEmail()) > 0) {
            log.info("Employee Twin with work email {} already exists (likely created via automation rule). Skipping manual conversion.", candidate.getEmail());
            recordAudit("Offer", saved.getId().toString(), AuditAction.UPDATE, "Candidate " + candidate.getFullName() + " accepted job offer. Statuses updated.");
            return saved;
        }

        log.info("Converting hired candidate {} to Employee Twin...", candidate.getFullName());
        EmployeeTwin employee = new EmployeeTwin();
        
        String fullName = candidate.getFullName();
        String firstName = fullName;
        String lastName = "Candidate";
        if (fullName.contains(" ")) {
            int firstSpace = fullName.indexOf(" ");
            firstName = fullName.substring(0, firstSpace);
            lastName = fullName.substring(firstSpace + 1);
        }
        
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setWorkEmail(candidate.getEmail());
        employee.setPersonalEmail(candidate.getEmail());
        employee.setPersonalPhone(candidate.getPhone());
        employee.setDateOfJoining(offer.getJoiningDate());
        employee.setEmploymentStatus(EmployeeTwin.EmploymentStatus.ACTIVE);
        
        // Link Org DNA values from Position
        Position position = offer.getPosition();
        if (position != null) {
            employee.setDepartmentId(position.getDepartmentId());
            employee.setGradeId(position.getGradeId());
            employee.setBandId(position.getBandId());
            employee.setLocationId(position.getLocationId());
        }
        
        // Force ACME seed organization ID
        employee.setOrganizationId(UUID.fromString("6841af62-9c16-431b-a8c2-a3adba1dc47a"));
        
        // Trigger Employee Creation & Onboarding
        String currentUser = TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system";
        employeeTwinService.createEmployee(employee, currentUser);

        recordAudit("Offer", saved.getId().toString(), AuditAction.UPDATE, "Candidate " + candidate.getFullName() + " accepted job offer. Converted to active employee twin.");
        return saved;
    }

    // ── Talent Pools ──────────────────────────────────────────
    @Override
    public TalentPool createTalentPool(TalentPool pool) {
        pool.setTenantId(TenantContext.getCurrentTenant());
        pool.setDeleted(false);
        TalentPool saved = talentPoolRepository.save(pool);
        recordAudit("TalentPool", saved.getId().toString(), AuditAction.CREATE, "Created talent pool " + saved.getPoolName());
        return saved;
    }

    @Override
    public List<TalentPool> getTalentPools() {
        return talentPoolRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    public TalentPool getTalentPool(UUID id) {
        return talentPoolRepository.findByIdAndTenantIdAndDeletedFalse(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new PlatformException("Talent pool not found", HttpStatus.NOT_FOUND, "POOL_NOT_FOUND"));
    }

    @Override
    public void addCandidateToPool(UUID candidateId, UUID poolId) {
        String tenantId = TenantContext.getCurrentTenant();
        Candidate candidate = candidateRepository.findByIdAndTenantIdAndDeletedFalse(candidateId, tenantId)
                .orElseThrow(() -> new PlatformException("Candidate not found", HttpStatus.NOT_FOUND, "CANDIDATE_NOT_FOUND"));
        
        TalentPool pool = talentPoolRepository.findByIdAndTenantIdAndDeletedFalse(poolId, tenantId)
                .orElseThrow(() -> new PlatformException("Talent pool not found", HttpStatus.NOT_FOUND, "POOL_NOT_FOUND"));

        if (!pool.getCandidates().contains(candidate)) {
            pool.getCandidates().add(candidate);
            talentPoolRepository.save(pool);
            recordAudit("TalentPool", poolId.toString(), AuditAction.UPDATE, "Added candidate " + candidate.getFullName() + " to talent pool " + pool.getPoolName());
        }
    }

    // ── Analytics ──────────────────────────────────────────
    @Override
    public Map<String, Object> getRecruitmentDashboard() {
        String tenantId = TenantContext.getCurrentTenant();
        List<Requisition> reqs = requisitionRepository.findByTenantIdAndDeletedFalse(tenantId);
        List<Candidate> candidates = candidateRepository.findByTenantIdAndDeletedFalse(tenantId);
        List<Offer> offers = offerRepository.findByTenantIdAndDeletedFalse(tenantId);

        long openReqs = reqs.stream().filter(r -> "PENDING_APPROVAL".equalsIgnoreCase(r.getStatus()) || "SUBMITTED".equalsIgnoreCase(r.getStatus())).count();
        long activePositions = positionRepository.count();
        long openJobs = jobPostingRepository.findByTenantIdAndStatusAndDeletedFalse(tenantId, "PUBLISHED").size();
        long candidatesApplied = candidates.size();
        long candidatesInPipeline = candidates.stream().filter(c -> !"JOINED".equalsIgnoreCase(c.getStatus()) && !"REJECTED".equalsIgnoreCase(c.getStatus())).count();
        long offersReleased = offers.stream().filter(o -> "RELEASED".equalsIgnoreCase(o.getStatus()) || "ACCEPTED".equalsIgnoreCase(o.getStatus())).count();
        long offersAccepted = offers.stream().filter(o -> "ACCEPTED".equalsIgnoreCase(o.getStatus()) || "JOINED".equalsIgnoreCase(o.getStatus())).count();

        Map<String, Long> funnel = new HashMap<>();
        for (Candidate c : candidates) {
            String stage = c.getStatus();
            funnel.put(stage, funnel.getOrDefault(stage, 0L) + 1);
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("openRequisitions", openReqs);
        dashboard.put("activePositions", activePositions);
        dashboard.put("openJobs", openJobs);
        dashboard.put("candidatesApplied", candidatesApplied);
        dashboard.put("candidatesInPipeline", candidatesInPipeline);
        dashboard.put("offersReleased", offersReleased);
        dashboard.put("offersAccepted", offersAccepted);
        dashboard.put("hiringFunnel", funnel);

        return dashboard;
    }

    // ── Comments ──────────────────────────────────────────
    @Override
    public RequisitionComment addRequisitionComment(UUID requisitionId, String commentText, String authorName) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(requisitionId, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
        
        RequisitionComment comment = new RequisitionComment();
        comment.setRequisition(req);
        comment.setTenantId(tenantId);
        comment.setCommentText(commentText);
        comment.setAuthorName(authorName != null ? authorName : "Anonymous");
        comment.setDeleted(false);
        comment.setCreatedBy(TenantContext.getCurrentUser());
        
        RequisitionComment saved = requisitionCommentRepository.save(comment);
        logActivity(req, "COMMENT_ADDED", "Added comment: " + commentText);
        return saved;
    }

    @Override
    public List<RequisitionComment> getRequisitionComments(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionCommentRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(requisitionId, tenantId);
    }

    // ── Attachments ──────────────────────────────────────────
    @Override
    public RequisitionAttachment addRequisitionAttachment(UUID requisitionId, String fileName, String fileType, String fileUrl, Long fileSize) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(requisitionId, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
        
        RequisitionAttachment att = new RequisitionAttachment();
        att.setRequisition(req);
        att.setTenantId(tenantId);
        att.setFileName(fileName);
        att.setFileType(fileType);
        att.setFileUrl(fileUrl);
        att.setFileSize(fileSize);
        att.setDeleted(false);
        att.setCreatedBy(TenantContext.getCurrentUser());
        
        RequisitionAttachment saved = requisitionAttachmentRepository.save(att);
        logActivity(req, "ATTACHMENT_UPLOADED", "Uploaded attachment: " + fileName);
        return saved;
    }

    @Override
    public List<RequisitionAttachment> getRequisitionAttachments(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionAttachmentRepository.findByRequisitionIdAndTenantIdAndDeletedFalse(requisitionId, tenantId);
    }

    @Override
    public void deleteRequisitionAttachment(UUID attachmentId) {
        RequisitionAttachment att = requisitionAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new PlatformException("Attachment not found", HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND"));
        att.setDeleted(true);
        requisitionAttachmentRepository.save(att);
    }

    // ── Activity Logs ──────────────────────────────────────────
    private void logActivity(Requisition req, String type, String desc) {
        RequisitionActivityLog log = new RequisitionActivityLog();
        log.setRequisition(req);
        log.setTenantId(req.getTenantId());
        log.setActivityType(type);
        log.setDescription(desc);
        log.setDeleted(false);
        log.setCreatedBy(TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system");
        requisitionActivityLogRepository.save(log);
    }

    @Override
    public List<RequisitionActivityLog> getRequisitionActivityLogs(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionActivityLogRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(requisitionId, tenantId);
    }

    // ── Custom Fields ──────────────────────────────────────────
    @Override
    public List<RequisitionCustomField> getRequisitionCustomFields() {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionCustomFieldRepository.findByTenantIdAndDeletedFalseOrderByDisplayOrderAsc(tenantId);
    }

    @Override
    public List<RequisitionCustomValue> getRequisitionCustomValues(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionCustomValueRepository.findByRequisitionIdAndTenantIdAndDeletedFalse(requisitionId, tenantId);
    }

    @Override
    public void saveRequisitionCustomValues(UUID requisitionId, List<Map<String, String>> values) {
        String tenantId = TenantContext.getCurrentTenant();
        Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(requisitionId, tenantId)
                .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
        
        List<RequisitionCustomValue> existing = requisitionCustomValueRepository.findByRequisitionIdAndTenantIdAndDeletedFalse(requisitionId, tenantId);
        requisitionCustomValueRepository.deleteAll(existing);
        
        if (values != null) {
            for (Map<String, String> entry : values) {
                String key = entry.get("fieldKey");
                String value = entry.get("fieldValue");
                if (key != null) {
                    RequisitionCustomValue val = new RequisitionCustomValue();
                    val.setRequisition(req);
                    val.setTenantId(tenantId);
                    val.setFieldKey(key);
                    val.setFieldValue(value);
                    val.setDeleted(false);
                    requisitionCustomValueRepository.save(val);
                }
            }
        }
    }

    // ── Drafts ──────────────────────────────────────────
    @Override
    public RequisitionDraft saveRequisitionDraft(String userId, String draftData) {
        String tenantId = TenantContext.getCurrentTenant();
        RequisitionDraft draft = requisitionDraftRepository.findByUserIdAndTenantIdAndDeletedFalse(userId, tenantId)
                .orElseGet(() -> {
                    RequisitionDraft d = new RequisitionDraft();
                    d.setUserId(userId);
                    d.setTenantId(tenantId);
                    d.setDeleted(false);
                    return d;
                });
        draft.setDraftData(draftData);
        return requisitionDraftRepository.save(draft);
    }

    @Override
    public RequisitionDraft getRequisitionDraft(String userId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionDraftRepository.findByUserIdAndTenantIdAndDeletedFalse(userId, tenantId)
                .orElse(null);
    }

    // ── Budget Analysis ──────────────────────────────────────────
    @Override
    public RequisitionBudgetAnalysis getRequisitionBudgetAnalysis(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionBudgetAnalysisRepository.findByRequisitionIdAndTenantIdAndDeletedFalse(requisitionId, tenantId)
                .orElseGet(() -> {
                    Requisition req = requisitionRepository.findByIdAndTenantIdAndDeletedFalse(requisitionId, tenantId)
                            .orElseThrow(() -> new PlatformException("Requisition not found", HttpStatus.NOT_FOUND, "REQ_NOT_FOUND"));
                    RequisitionBudgetAnalysis analysis = new RequisitionBudgetAnalysis();
                    analysis.setRequisition(req);
                    analysis.setTenantId(tenantId);
                    analysis.setDeptHeadcount(15);
                    analysis.setOpenPositions(3);
                    analysis.setBudgetConsumed(new BigDecimal("1250000.00"));
                    analysis.setBudgetAvailable(new BigDecimal("350000.00"));
                    analysis.setRequestedBudget(req.getBudget() != null ? req.getBudget() : BigDecimal.ZERO);
                    analysis.setProjectedBudget(analysis.getBudgetConsumed().add(analysis.getRequestedBudget()));
                    return requisitionBudgetAnalysisRepository.save(analysis);
                });
    }

    // ── Approval Steps ──────────────────────────────────────────
    @Override
    public List<RequisitionApprovalStep> getRequisitionApprovalSteps(UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        return requisitionApprovalStepRepository.findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepOrderAsc(requisitionId, tenantId);
    }
}
