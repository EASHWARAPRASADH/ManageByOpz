package com.managemyopz.twin.listener;

import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTimeline;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.event.EmployeeCreatedEvent;
import com.managemyopz.twin.event.EmployeeManagerChangedEvent;
import com.managemyopz.twin.event.EmployeePromotedEvent;
import com.managemyopz.twin.event.EmployeeTerminatedEvent;
import com.managemyopz.twin.event.EmployeeTransferredEvent;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmployeeTimelineEventListener {

    private final EmployeeTwinRepository twinRepository;

    @Async
    @EventListener
    @Transactional
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        log.info("Timeline Event: Employee Created - id={}", event.getAggregateId());
        TenantContext.setCurrentTenant(event.getTenantId());
        
        EmployeeTwin twin = twinRepository.findById(event.getAggregateId()).orElse(null);
        if (twin != null) {
            EmployeeTimeline timeline = new EmployeeTimeline();
            timeline.setEmployeeTwin(twin);
            timeline.setEventType(EmployeeTimeline.TimelineEventType.JOINING);
            timeline.setEventDate(LocalDate.now());
            timeline.setTitle("Joined the Organization");
            timeline.setDescription("Onboarded profile as: " + event.getFullName() + " under code " + event.getEmployeeCode());
            timeline.setTriggeredBy(event.getTriggeredBy());
            timeline.setTenantId(event.getTenantId());
            
            twin.getTimeline().add(timeline);
            twinRepository.save(twin);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void onEmployeePromoted(EmployeePromotedEvent event) {
        log.info("Timeline Event: Employee Promoted - id={}", event.getAggregateId());
        TenantContext.setCurrentTenant(event.getTenantId());
        
        EmployeeTwin twin = twinRepository.findById(event.getAggregateId()).orElse(null);
        if (twin != null) {
            EmployeeTimeline timeline = new EmployeeTimeline();
            timeline.setEmployeeTwin(twin);
            timeline.setEventType(EmployeeTimeline.TimelineEventType.PROMOTION);
            timeline.setEventDate(LocalDate.now());
            timeline.setTitle("Promoted to New Grade/Designation");
            timeline.setDescription("Promoted by manager/system.");
            timeline.setTriggeredBy(event.getTriggeredBy());
            timeline.setTenantId(event.getTenantId());
            
            twin.getTimeline().add(timeline);
            twinRepository.save(twin);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void onEmployeeTransferred(EmployeeTransferredEvent event) {
        log.info("Timeline Event: Employee Transferred - id={}", event.getAggregateId());
        TenantContext.setCurrentTenant(event.getTenantId());
        
        EmployeeTwin twin = twinRepository.findById(event.getAggregateId()).orElse(null);
        if (twin != null) {
            EmployeeTimeline timeline = new EmployeeTimeline();
            timeline.setEmployeeTwin(twin);
            timeline.setEventType(EmployeeTimeline.TimelineEventType.TRANSFER);
            timeline.setEventDate(LocalDate.now());
            timeline.setTitle("Transferred to New Location/Department");
            timeline.setDescription("Transferred internally.");
            timeline.setTriggeredBy(event.getTriggeredBy());
            timeline.setTenantId(event.getTenantId());
            
            twin.getTimeline().add(timeline);
            twinRepository.save(twin);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void onEmployeeTerminated(EmployeeTerminatedEvent event) {
        log.info("Timeline Event: Employee Terminated - id={}", event.getAggregateId());
        TenantContext.setCurrentTenant(event.getTenantId());
        
        EmployeeTwin twin = twinRepository.findById(event.getAggregateId()).orElse(null);
        if (twin != null) {
            EmployeeTimeline timeline = new EmployeeTimeline();
            timeline.setEmployeeTwin(twin);
            timeline.setEventType(EmployeeTimeline.TimelineEventType.TERMINATION);
            timeline.setEventDate(event.getExitDate());
            timeline.setTitle("Terminated / Resigned");
            timeline.setDescription("Exited: " + event.getReason());
            timeline.setTriggeredBy(event.getTriggeredBy());
            timeline.setTenantId(event.getTenantId());
            
            twin.getTimeline().add(timeline);
            twinRepository.save(twin);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void onEmployeeManagerChanged(EmployeeManagerChangedEvent event) {
        log.info("Timeline Event: Employee Manager Changed - id={}", event.getAggregateId());
        TenantContext.setCurrentTenant(event.getTenantId());
        
        EmployeeTwin twin = twinRepository.findById(event.getAggregateId()).orElse(null);
        if (twin != null) {
            EmployeeTimeline timeline = new EmployeeTimeline();
            timeline.setEmployeeTwin(twin);
            timeline.setEventType(EmployeeTimeline.TimelineEventType.ROLE_CHANGE);
            timeline.setEventDate(event.getEffectiveDate());
            timeline.setTitle("Manager Reassigned");
            
            EmployeeTwin manager = event.getNewManagerId() != null ? twinRepository.findById(event.getNewManagerId()).orElse(null) : null;
            String managerName = manager != null ? manager.getFullName() : "None";
            
            timeline.setDescription("Manager reassigned to: " + managerName + ". Reason: " + event.getReason());
            timeline.setTriggeredBy(event.getTriggeredBy());
            timeline.setTenantId(event.getTenantId());
            
            twin.getTimeline().add(timeline);
            twinRepository.save(twin);
        }
    }
}
