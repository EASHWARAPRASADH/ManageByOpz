package com.managemyopz.recognition.service;

import com.managemyopz.recognition.entity.RecognitionType;
import com.managemyopz.recognition.entity.RecognitionValue;
import com.managemyopz.recognition.repository.RecognitionTypeRepository;
import com.managemyopz.recognition.repository.RecognitionValueRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecognitionSeeder implements ApplicationRunner {

    private final RecognitionValueRepository valueRepository;
    private final RecognitionTypeRepository typeRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("=== STARTING RECOGNITION PLATFORM SEEDER ===");
        
        // Seed for "default" and "ACME"
        seedForTenant("default");
        seedForTenant("ACME");
        
        log.info("=== RECOGNITION PLATFORM SEEDER COMPLETED ===");
    }

    private void seedForTenant(String tenantId) {
        TenantContext.setCurrentTenant(tenantId);
        try {
            seedCoreValues(tenantId);
            seedRecognitionTypes(tenantId);
        } finally {
            TenantContext.clear();
        }
    }

    private void seedCoreValues(String tenantId) {
        // Values list: Teamwork, Innovation, Customer First, Ownership, Integrity, Excellence, Leadership, Collaboration
        List<ValDto> values = List.of(
            new ValDto("Teamwork", "TEAMWORK", "Collaborating effectively with team members", "Users", "purple", 1.0),
            new ValDto("Innovation", "INNOVATION", "Promotes out-of-the-box thinking and creative problem solving", "Sparkles", "indigo", 1.2),
            new ValDto("Customer First", "CUSTOMER_FIRST", "Puts client satisfaction and relationship at the core", "Heart", "emerald", 1.2),
            new ValDto("Ownership", "OWNERSHIP", "Taking full responsibility and driving results", "Target", "blue", 1.1),
            new ValDto("Integrity", "INTEGRITY", "Doing the right thing, always", "Shield", "blue", 1.0),
            new ValDto("Excellence", "EXCELLENCE", "Delivers superior quality and high performance", "Trophy", "amber", 1.3),
            new ValDto("Leadership", "LEADERSHIP", "Empowers others and leads by positive example", "Star", "orange", 1.2),
            new ValDto("Collaboration", "COLLABORATION", "Stronger together as one cohesive team", "Users", "purple", 1.0)
        );

        for (ValDto dto : values) {
            if (valueRepository.findByCodeAndTenantId(dto.code, tenantId).isEmpty()) {
                RecognitionValue val = RecognitionValue.builder()
                        .name(dto.name)
                        .code(dto.code)
                        .description(dto.description)
                        .icon(dto.icon)
                        .color(dto.color)
                        .weight(dto.weight)
                        .status("ACTIVE")
                        .build();
                val.setTenantId(tenantId);
                val.setCreatedBy("system");
                valueRepository.save(val);
                log.info("Seeded core value {} for tenant {}", dto.code, tenantId);
            }
        }
    }

    private void seedRecognitionTypes(String tenantId) {
        // Types list: Peer Recognition, Manager Recognition, Spot Award, Achievement Award, Innovation Award, Leadership Award
        List<TypeDto> types = List.of(
            new TypeDto("Peer Recognition", "PEER_RECOGNITION", "Appreciation from a peer or colleague", 50, "PUBLIC", "NONE", "Team Player"),
            new TypeDto("Manager Recognition", "MANAGER_RECOGNITION", "Appreciation from a manager or team lead", 100, "PUBLIC", "NONE", "Problem Solver"),
            new TypeDto("Spot Award", "SPOT_AWARD", "Immediate award for high performance on a task", 150, "PUBLIC", "MANAGER", "Super Achiever"),
            new TypeDto("Achievement Award", "ACHIEVEMENT_AWARD", "Recognition for completing a major milestone or target", 200, "PUBLIC", "MANAGER", "Milestone Master"),
            new TypeDto("Innovation Award", "INNOVATION_AWARD", "Recognition for creative and high impact ideas", 250, "PUBLIC", "MANAGER", "Super Architect"),
            new TypeDto("Leadership Award", "LEADERSHIP_AWARD", "Recognition for exceptional leadership and guidance", 300, "PUBLIC", "MANAGER", "Culture Champion")
        );

        for (TypeDto dto : types) {
            if (typeRepository.findByCodeAndTenantId(dto.code, tenantId).isEmpty()) {
                RecognitionType type = RecognitionType.builder()
                        .name(dto.name)
                        .code(dto.code)
                        .description(dto.description)
                        .defaultPoints(dto.defaultPoints)
                        .visibilityRules(dto.visibilityRules)
                        .approvalRules(dto.approvalRules)
                        .badgeMapping(dto.badgeMapping)
                        .status("ACTIVE")
                        .build();
                type.setTenantId(tenantId);
                type.setCreatedBy("system");
                typeRepository.save(type);
                log.info("Seeded recognition type {} for tenant {}", dto.code, tenantId);
            }
        }
    }

    private static class ValDto {
        String name, code, description, icon, color;
        double weight;
        ValDto(String name, String code, String description, String icon, String color, double weight) {
            this.name = name; this.code = code; this.description = description;
            this.icon = icon; this.color = color; this.weight = weight;
        }
    }

    private static class TypeDto {
        String name, code, description;
        int defaultPoints;
        String visibilityRules, approvalRules, badgeMapping;
        TypeDto(String name, String code, String description, int defaultPoints, String visibilityRules, String approvalRules, String badgeMapping) {
            this.name = name; this.code = code; this.description = description;
            this.defaultPoints = defaultPoints; this.visibilityRules = visibilityRules;
            this.approvalRules = approvalRules; this.badgeMapping = badgeMapping;
        }
    }
}
