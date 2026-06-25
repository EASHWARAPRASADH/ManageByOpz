package com.managemyopz.workflow.repository;

import com.managemyopz.workflow.entity.ApprovalTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalTaskRepository extends JpaRepository<ApprovalTask, UUID> {

    List<ApprovalTask> findByApproverEmployeeIdAndDeletedFalse(UUID approverEmployeeId);

    List<ApprovalTask> findByApproverEmployeeIdAndActionStatusAndDeletedFalse(UUID approverEmployeeId, String actionStatus);

    List<ApprovalTask> findByWorkflowInstanceIdAndActionStatusAndDeletedFalse(UUID workflowInstanceId, String actionStatus);

    @Query("SELECT t FROM ApprovalTask t WHERE (t.approverEmployeeId = :employeeId OR t.delegatedTo = :employeeId) AND t.deleted = false")
    List<ApprovalTask> findActiveTasksForEmployee(@Param("employeeId") UUID employeeId);
}
