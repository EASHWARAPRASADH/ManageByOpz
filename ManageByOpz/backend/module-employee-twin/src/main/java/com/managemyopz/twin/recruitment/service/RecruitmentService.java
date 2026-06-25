package com.managemyopz.twin.recruitment.service;

import com.managemyopz.twin.recruitment.entity.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RecruitmentService {
    // Requisitions
    Requisition createRequisition(Requisition req);
    Requisition updateRequisition(UUID id, Requisition req);
    List<Requisition> getRequisitions();
    Requisition getRequisition(UUID id);
    Requisition submitRequisition(UUID id);
    Requisition approveRequisition(UUID id, UUID approverId, String comments);
    Requisition rejectRequisition(UUID id, UUID approverId, String comments);

    // Comments
    RequisitionComment addRequisitionComment(UUID requisitionId, String commentText, String authorName);
    List<RequisitionComment> getRequisitionComments(UUID requisitionId);

    // Attachments
    RequisitionAttachment addRequisitionAttachment(UUID requisitionId, String fileName, String fileType, String fileUrl, Long fileSize);
    List<RequisitionAttachment> getRequisitionAttachments(UUID requisitionId);
    void deleteRequisitionAttachment(UUID attachmentId);

    // Activity Logs
    List<RequisitionActivityLog> getRequisitionActivityLogs(UUID requisitionId);

    // Custom Fields
    List<RequisitionCustomField> getRequisitionCustomFields();
    List<RequisitionCustomValue> getRequisitionCustomValues(UUID requisitionId);
    void saveRequisitionCustomValues(UUID requisitionId, List<Map<String, String>> values);

    // Drafts
    RequisitionDraft saveRequisitionDraft(String userId, String draftData);
    RequisitionDraft getRequisitionDraft(String userId);

    // Budget Analysis
    RequisitionBudgetAnalysis getRequisitionBudgetAnalysis(UUID requisitionId);

    // Approval Steps
    List<RequisitionApprovalStep> getRequisitionApprovalSteps(UUID requisitionId);

    // Job Postings
    JobPosting createJobPosting(JobPosting posting);
    JobPosting updateJobPosting(UUID id, JobPosting posting);
    List<JobPosting> getJobPostings(String status);
    JobPosting getJobPosting(UUID id);
    JobPosting changeJobPostingStatus(UUID id, String status);
    JobPosting activateJob(UUID id);
    JobPosting duplicateJob(UUID id);
    JobPosting archiveJob(UUID id);

    // Candidates
    Candidate createCandidate(Candidate candidate);
    Candidate updateCandidate(UUID id, Candidate candidate);
    List<Candidate> getCandidates();
    Candidate getCandidate(UUID id);
    Candidate moveCandidateStage(UUID id, String status);
    CandidateNote addCandidateNote(UUID candidateId, String noteText, UUID authorId);
    List<CandidateNote> getCandidateNotes(UUID candidateId);
    List<CandidateActivity> getCandidateActivities(UUID candidateId);

    // Interviews
    Interview scheduleInterview(Interview interview);
    Interview updateInterview(UUID id, Interview interview);
    List<Interview> getInterviews();
    Interview getInterview(UUID id);
    InterviewFeedback submitFeedback(UUID interviewId, InterviewFeedback feedback);

    // Offers
    Offer createOffer(Offer offer);
    Offer updateOffer(UUID id, Offer offer);
    List<Offer> getOffers();
    Offer getOffer(UUID id);
    Offer approveOffer(UUID id, UUID approverId, String comments);
    Offer rejectOffer(UUID id, UUID approverId, String comments);
    Offer acceptOffer(UUID id);

    // Talent Pools
    TalentPool createTalentPool(TalentPool pool);
    List<TalentPool> getTalentPools();
    TalentPool getTalentPool(UUID id);
    void addCandidateToPool(UUID candidateId, UUID poolId);

    // Dashboard Analytics
    Map<String, Object> getRecruitmentDashboard();
}
