package com.managemyopz.twin.recruitment.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.recruitment.entity.RequisitionSkill;
import com.managemyopz.twin.recruitment.entity.SkillMaster;
import com.managemyopz.twin.recruitment.repository.RequisitionSkillRepository;
import com.managemyopz.twin.recruitment.repository.SkillMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN', 'ROLE_RECRUITER', 'ROLE_MANAGER')")
public class SkillsController {

    private final SkillMasterRepository skillMasterRepository;
    private final RequisitionSkillRepository requisitionSkillRepository;

    @GetMapping("/skills/search")
    public ApiResponse<List<SkillMaster>> searchSkills(@RequestParam("q") String query) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            tenantId = "ACME";
        }
        log.info("Searching skills for tenant: {} with query: {}", tenantId, query);
        List<SkillMaster> results = skillMasterRepository.findByTenantIdAndSkillNameContainingIgnoreCaseAndDeletedFalse(tenantId, query);
        return ApiResponse.success(results, "Skills search completed");
    }

    @PostMapping("/skills")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SkillMaster> saveSkill(@RequestBody SkillMaster skill) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            tenantId = "ACME";
        }
        log.info("Saving skill for tenant: {} with name: {}", tenantId, skill.getSkillName());
        skill.setTenantId(tenantId);
        skill.setActive(true);
        SkillMaster saved = skillMasterRepository.save(skill);
        return ApiResponse.created(saved, "Skill saved successfully");
    }

    @GetMapping("/requisitions/{id}/skills")
    public ApiResponse<List<RequisitionSkill>> getRequisitionSkills(@PathVariable("id") UUID requisitionId) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            tenantId = "ACME";
        }
        log.info("Fetching skills for requisition: {} and tenant: {}", requisitionId, tenantId);
        List<RequisitionSkill> skills = requisitionSkillRepository.findByRequisitionIdAndTenantId(requisitionId, tenantId);
        return ApiResponse.success(skills, "Requisition skills retrieved successfully");
    }

    @PostMapping("/requisitions/{id}/skills")
    @Transactional
    public ApiResponse<List<RequisitionSkill>> saveRequisitionSkills(
            @PathVariable("id") UUID requisitionId,
            @RequestBody List<RequisitionSkill> skills) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            tenantId = "ACME";
        }
        log.info("Saving {} skills for requisition: {} and tenant: {}", skills.size(), requisitionId, tenantId);
        
        // Clean up existing skills for this requisition
        requisitionSkillRepository.deleteByRequisitionIdAndTenantId(requisitionId, tenantId);

        // Save new ones
        for (RequisitionSkill skill : skills) {
            skill.setId(null);
            skill.setRequisitionId(requisitionId);
            skill.setTenantId(tenantId);
            requisitionSkillRepository.save(skill);
        }

        List<RequisitionSkill> savedSkills = requisitionSkillRepository.findByRequisitionIdAndTenantId(requisitionId, tenantId);
        return ApiResponse.success(savedSkills, "Requisition skills saved successfully");
    }
}
