package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, UUID> {
    List<InterviewFeedback> findByInterviewIdAndTenantIdAndDeletedFalse(UUID interviewId, String tenantId);
}
