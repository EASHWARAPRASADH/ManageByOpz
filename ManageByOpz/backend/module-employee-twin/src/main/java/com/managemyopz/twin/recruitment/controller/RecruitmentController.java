package com.managemyopz.twin.recruitment.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.twin.recruitment.entity.*;
import com.managemyopz.twin.recruitment.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/recruitment")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN', 'ROLE_RECRUITER', 'ROLE_MANAGER')")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    // ── Requisitions ──────────────────────────────────────────
    @PostMapping("/requisitions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_CREATE')")
    public ApiResponse<Requisition> createRequisition(@RequestBody Requisition req) {
        logRequestDetails("createRequisition");
        return ApiResponse.created(recruitmentService.createRequisition(req), "Requisition created successfully");
    }

    @PutMapping("/requisitions/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_EDIT')")
    public ApiResponse<Requisition> updateRequisition(@PathVariable UUID id, @RequestBody Requisition req) {
        logRequestDetails("updateRequisition");
        return ApiResponse.success(recruitmentService.updateRequisition(id, req), "Requisition updated successfully");
    }

    @GetMapping("/requisitions")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_VIEW')")
    public ApiResponse<List<Requisition>> getRequisitions() {
        logRequestDetails("getRequisitions");
        return ApiResponse.success(recruitmentService.getRequisitions(), "Requisitions retrieved successfully");
    }

    @GetMapping("/requisitions/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_VIEW')")
    public ApiResponse<Requisition> getRequisition(@PathVariable UUID id) {
        logRequestDetails("getRequisition");
        return ApiResponse.success(recruitmentService.getRequisition(id), "Requisition retrieved successfully");
    }

    @PostMapping("/requisitions/{id}/submit")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_EDIT')")
    public ApiResponse<Requisition> submitRequisition(@PathVariable UUID id) {
        logRequestDetails("submitRequisition");
        return ApiResponse.success(recruitmentService.submitRequisition(id), "Requisition submitted for approval");
    }

    @PostMapping("/requisitions/{id}/approve")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_APPROVE')")
    public ApiResponse<Requisition> approveRequisition(@PathVariable UUID id, @RequestParam UUID approverId, @RequestParam(required = false) String comments) {
        logRequestDetails("approveRequisition");
        return ApiResponse.success(recruitmentService.approveRequisition(id, approverId, comments), "Requisition approved successfully");
    }

    @PostMapping("/requisitions/{id}/reject")
    @PreAuthorize("@rbac.hasPermission(authentication, 'REQUISITION_APPROVE')")
    public ApiResponse<Requisition> rejectRequisition(@PathVariable UUID id, @RequestParam UUID approverId, @RequestParam(required = false) String comments) {
        logRequestDetails("rejectRequisition");
        return ApiResponse.success(recruitmentService.rejectRequisition(id, approverId, comments), "Requisition rejected");
    }

    @PostMapping("/requisitions/{id}/comments")
    public ApiResponse<RequisitionComment> addComment(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String commentText = body.get("commentText");
        String authorName = body.get("authorName");
        return ApiResponse.success(recruitmentService.addRequisitionComment(id, commentText, authorName), "Comment added");
    }

    @GetMapping("/requisitions/{id}/comments")
    public ApiResponse<List<RequisitionComment>> getComments(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionComments(id), "Comments retrieved");
    }

    @PostMapping("/requisitions/{id}/attachments")
    public ApiResponse<RequisitionAttachment> addAttachment(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String fileName = (String) body.get("fileName");
        String fileType = (String) body.get("fileType");
        String fileUrl = (String) body.get("fileUrl");
        Number fileSize = (Number) body.get("fileSize");
        Long size = fileSize != null ? fileSize.longValue() : 0L;
        return ApiResponse.success(recruitmentService.addRequisitionAttachment(id, fileName, fileType, fileUrl, size), "Attachment added");
    }

    @GetMapping("/requisitions/{id}/attachments")
    public ApiResponse<List<RequisitionAttachment>> getAttachments(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionAttachments(id), "Attachments retrieved");
    }

    @DeleteMapping("/requisitions/attachments/{attachmentId}")
    public ApiResponse<Void> deleteAttachment(@PathVariable UUID attachmentId) {
        recruitmentService.deleteRequisitionAttachment(attachmentId);
        return ApiResponse.success(null, "Attachment deleted");
    }

    @GetMapping("/requisitions/{id}/activities")
    public ApiResponse<List<RequisitionActivityLog>> getActivityLogs(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionActivityLogs(id), "Activity logs retrieved");
    }

    @GetMapping("/requisitions/custom-fields")
    public ApiResponse<List<RequisitionCustomField>> getCustomFields() {
        return ApiResponse.success(recruitmentService.getRequisitionCustomFields(), "Custom fields retrieved");
    }

    @GetMapping("/requisitions/{id}/custom-values")
    public ApiResponse<List<RequisitionCustomValue>> getCustomValues(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionCustomValues(id), "Custom values retrieved");
    }

    @PostMapping("/requisitions/{id}/custom-values")
    public ApiResponse<Void> saveCustomValues(@PathVariable UUID id, @RequestBody List<Map<String, String>> values) {
        recruitmentService.saveRequisitionCustomValues(id, values);
        return ApiResponse.success(null, "Custom values saved");
    }

    @PostMapping("/requisitions/drafts")
    public ApiResponse<RequisitionDraft> saveDraft(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String draftData = body.get("draftData");
        return ApiResponse.success(recruitmentService.saveRequisitionDraft(userId, draftData), "Draft saved");
    }

    @GetMapping("/requisitions/drafts")
    public ApiResponse<RequisitionDraft> getDraft(@RequestParam String userId) {
        return ApiResponse.success(recruitmentService.getRequisitionDraft(userId), "Draft retrieved");
    }

    @GetMapping("/requisitions/{id}/budget-analysis")
    public ApiResponse<RequisitionBudgetAnalysis> getBudgetAnalysis(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionBudgetAnalysis(id), "Budget analysis retrieved");
    }

    @GetMapping("/requisitions/{id}/approval-steps")
    public ApiResponse<List<RequisitionApprovalStep>> getApprovalSteps(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getRequisitionApprovalSteps(id), "Approval steps retrieved");
    }

    // ── Job Postings ──────────────────────────────────────────
    @PostMapping("/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobPosting> createJobPosting(@RequestBody JobPosting posting) {
        return ApiResponse.created(recruitmentService.createJobPosting(posting), "Job Posting created successfully");
    }

    @PutMapping("/jobs/{id}")
    public ApiResponse<JobPosting> updateJobPosting(@PathVariable UUID id, @RequestBody JobPosting posting) {
        return ApiResponse.success(recruitmentService.updateJobPosting(id, posting), "Job Posting updated successfully");
    }

    @GetMapping("/jobs")
    public ApiResponse<List<JobPosting>> getJobPostings(@RequestParam(required = false) String status) {
        return ApiResponse.success(recruitmentService.getJobPostings(status), "Job Postings retrieved successfully");
    }

    @GetMapping("/jobs/{id}")
    public ApiResponse<JobPosting> getJobPosting(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getJobPosting(id), "Job Posting retrieved successfully");
    }

    @PutMapping("/jobs/{id}/status")
    public ApiResponse<JobPosting> changeJobPostingStatus(@PathVariable UUID id, @RequestParam String status) {
        return ApiResponse.success(recruitmentService.changeJobPostingStatus(id, status), "Job Posting status changed successfully");
    }

    @PutMapping("/jobs/{id}/activate")
    public ApiResponse<JobPosting> activateJob(@PathVariable UUID id) {
        logRequestDetails("activateJob");
        return ApiResponse.success(recruitmentService.activateJob(id), "Job Posting activated successfully");
    }

    @PostMapping("/jobs/{id}/duplicate")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobPosting> duplicateJob(@PathVariable UUID id) {
        logRequestDetails("duplicateJob");
        return ApiResponse.created(recruitmentService.duplicateJob(id), "Job Posting duplicated successfully");
    }

    @PutMapping("/jobs/{id}/archive")
    public ApiResponse<JobPosting> archiveJob(@PathVariable UUID id) {
        logRequestDetails("archiveJob");
        return ApiResponse.success(recruitmentService.archiveJob(id), "Job Posting archived successfully");
    }

    // ── Candidates ──────────────────────────────────────────
    @PostMapping("/candidates")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("permitAll()") // Allow public candidates to apply via Careers Portal
    public ApiResponse<Candidate> createCandidate(@RequestBody Candidate candidate) {
        return ApiResponse.created(recruitmentService.createCandidate(candidate), "Candidate registered successfully");
    }

    @PutMapping("/candidates/{id}")
    public ApiResponse<Candidate> updateCandidate(@PathVariable UUID id, @RequestBody Candidate candidate) {
        return ApiResponse.success(recruitmentService.updateCandidate(id, candidate), "Candidate updated successfully");
    }

    @GetMapping("/candidates")
    public ApiResponse<List<Candidate>> getCandidates() {
        return ApiResponse.success(recruitmentService.getCandidates(), "Candidates retrieved successfully");
    }

    @GetMapping("/candidates/{id}")
    public ApiResponse<Candidate> getCandidate(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getCandidate(id), "Candidate retrieved successfully");
    }

    @PutMapping("/candidates/{id}/stage")
    public ApiResponse<Candidate> moveCandidateStage(@PathVariable UUID id, @RequestParam String status) {
        return ApiResponse.success(recruitmentService.moveCandidateStage(id, status), "Candidate status stage updated");
    }

    @PostMapping("/candidates/{id}/notes")
    public ApiResponse<CandidateNote> addCandidateNote(@PathVariable UUID id, @RequestParam String noteText, @RequestParam UUID authorId) {
        return ApiResponse.created(recruitmentService.addCandidateNote(id, noteText, authorId), "Comment note added to candidate");
    }

    @GetMapping("/candidates/{id}/notes")
    public ApiResponse<List<CandidateNote>> getCandidateNotes(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getCandidateNotes(id), "Candidate comment notes retrieved");
    }

    @GetMapping("/candidates/{id}/activities")
    public ApiResponse<List<CandidateActivity>> getCandidateActivities(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getCandidateActivities(id), "Candidate timeline activities retrieved");
    }

    // ── Interviews ──────────────────────────────────────────
    @PostMapping("/interviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Interview> scheduleInterview(@RequestBody Interview interview) {
        return ApiResponse.created(recruitmentService.scheduleInterview(interview), "Interview scheduled successfully");
    }

    @PutMapping("/interviews/{id}")
    public ApiResponse<Interview> updateInterview(@PathVariable UUID id, @RequestBody Interview interview) {
        return ApiResponse.success(recruitmentService.updateInterview(id, interview), "Interview details updated");
    }

    @GetMapping("/interviews")
    public ApiResponse<List<Interview>> getInterviews() {
        return ApiResponse.success(recruitmentService.getInterviews(), "Interviews retrieved successfully");
    }

    @GetMapping("/interviews/{id}")
    public ApiResponse<Interview> getInterview(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getInterview(id), "Interview details retrieved");
    }

    @PostMapping("/interviews/{id}/feedback")
    public ApiResponse<InterviewFeedback> submitFeedback(@PathVariable UUID id, @RequestBody InterviewFeedback feedback) {
        return ApiResponse.success(recruitmentService.submitFeedback(id, feedback), "Feedback scorecard submitted successfully");
    }

    // ── Offers ──────────────────────────────────────────
    @PostMapping("/offers")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Offer> createOffer(@RequestBody Offer offer) {
        return ApiResponse.created(recruitmentService.createOffer(offer), "Offer details generated");
    }

    @PutMapping("/offers/{id}")
    public ApiResponse<Offer> updateOffer(@PathVariable UUID id, @RequestBody Offer offer) {
        return ApiResponse.success(recruitmentService.updateOffer(id, offer), "Offer details updated");
    }

    @GetMapping("/offers")
    public ApiResponse<List<Offer>> getOffers() {
        return ApiResponse.success(recruitmentService.getOffers(), "Offers retrieved successfully");
    }

    @GetMapping("/offers/{id}")
    public ApiResponse<Offer> getOffer(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getOffer(id), "Offer details retrieved");
    }

    @PostMapping("/offers/{id}/approve")
    public ApiResponse<Offer> approveOffer(@PathVariable UUID id, @RequestParam UUID approverId, @RequestParam(required = false) String comments) {
        return ApiResponse.success(recruitmentService.approveOffer(id, approverId, comments), "Offer package approved/released");
    }

    @PostMapping("/offers/{id}/reject")
    public ApiResponse<Offer> rejectOffer(@PathVariable UUID id, @RequestParam UUID approverId, @RequestParam(required = false) String comments) {
        return ApiResponse.success(recruitmentService.rejectOffer(id, approverId, comments), "Offer package rejected");
    }

    @PostMapping("/offers/{id}/accept")
    public ApiResponse<Offer> acceptOffer(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.acceptOffer(id), "Offer accepted and digital twin creation started");
    }

    // ── Talent Pools ──────────────────────────────────────────
    @PostMapping("/pools")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TalentPool> createTalentPool(@RequestBody TalentPool pool) {
        return ApiResponse.created(recruitmentService.createTalentPool(pool), "Talent pool created successfully");
    }

    @GetMapping("/pools")
    public ApiResponse<List<TalentPool>> getTalentPools() {
        return ApiResponse.success(recruitmentService.getTalentPools(), "Talent pools retrieved successfully");
    }

    @GetMapping("/pools/{id}")
    public ApiResponse<TalentPool> getTalentPool(@PathVariable UUID id) {
        return ApiResponse.success(recruitmentService.getTalentPool(id), "Talent pool details retrieved");
    }

    @PostMapping("/pools/{id}/candidates")
    public ApiResponse<Void> addCandidateToPool(@PathVariable UUID id, @RequestParam UUID candidateId) {
        recruitmentService.addCandidateToPool(candidateId, id);
        return ApiResponse.success(null, "Candidate added to talent pool");
    }

    // ── Dashboard Analytics ──────────────────────────────────────────
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> getRecruitmentDashboard() {
        return ApiResponse.success(recruitmentService.getRecruitmentDashboard(), "Recruitment analytics dashboard statistics retrieved");
    }

    private void logRequestDetails(String action) {
        try {
            org.springframework.web.context.request.ServletRequestAttributes attributes = 
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                jakarta.servlet.http.HttpServletRequest request = attributes.getRequest();
                log.info("[Security Audit] Endpoint: {}, Method: {}, URI: {}", action, request.getMethod(), request.getRequestURI());
                
                // Log headers
                java.util.Enumeration<String> headerNames = request.getHeaderNames();
                while (headerNames.hasMoreElements()) {
                    String name = headerNames.nextElement();
                    log.info("[Security Audit] Header '{}': {}", name, request.getHeader(name));
                }
            }
            
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                log.info("[Security Audit] Auth Principal: {}", auth.getName());
                log.info("[Security Audit] Auth Authorities: {}", auth.getAuthorities());
                log.info("[Security Audit] TenantContext Tenant ID: {}", com.managemyopz.shared.entity.TenantContext.getCurrentTenant());
            } else {
                log.warn("[Security Audit] No authentication object found in SecurityContextHolder");
            }
        } catch (Exception e) {
            log.error("[Security Audit] Failed to log request details", e);
        }
    }
}
