package com.managemyopz.leave.listener;

import com.managemyopz.twin.event.EmployeeCreatedEvent;
import com.managemyopz.leave.service.LeavePolicyAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class LeaveOnboardingListener {

    @Autowired
    private LeavePolicyAssignmentService leavePolicyAssignmentService;

    @EventListener
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        if (event.getAggregateId() != null) {
            leavePolicyAssignmentService.generateWallets(event.getAggregateId());
        }
    }
}
