package com.managemyopz.twin.service;

import com.managemyopz.orgdna.entity.Organization;
import com.managemyopz.orgdna.entity.BusinessUnit;
import com.managemyopz.orgdna.entity.EmployeeCodeSequence;
import com.managemyopz.orgdna.repository.OrganizationRepository;
import com.managemyopz.orgdna.repository.BusinessUnitRepository;
import com.managemyopz.orgdna.repository.EmployeeCodeSequenceRepository;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeCodeGeneratorService {

    private final OrganizationRepository organizationRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final EmployeeCodeSequenceRepository sequenceRepository;
    private final EmployeeTwinRepository employeeTwinRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateEmployeeCode(UUID organizationId) {
        return generateNextEmployeeCode(organizationId, null);
    }

    public String previewNextEmployeeCode(UUID organizationId) {
        return previewNextCode(organizationId, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateNextEmployeeCode(UUID organizationId, UUID businessUnitId) {
        UUID targetOrgId = organizationId != null ? organizationId : UUID.nameUUIDFromBytes("default-org".getBytes());

        Organization org = organizationId != null ? organizationRepository.findById(organizationId).orElse(null) : null;
        String orgCode = org != null ? org.getCode() : "ORG";
        String pattern = org != null && org.getEmployeeCodePattern() != null ? org.getEmployeeCodePattern() : "{ORG}-{SEQ:6}";
        String prefix = org != null && org.getEmployeeCodePrefix() != null ? org.getEmployeeCodePrefix() : orgCode;
        int seqLength = org != null && org.getSequenceLength() != null ? org.getSequenceLength() : 6;
        int startingSeq = org != null && org.getStartingSequenceNumber() != null ? org.getStartingSequenceNumber() : 1;

        EmployeeCodeSequence seq = sequenceRepository.findByOrganizationIdForUpdate(targetOrgId)
                .orElseGet(() -> {
                    EmployeeCodeSequence newSeq = new EmployeeCodeSequence();
                    newSeq.setOrganizationId(targetOrgId);
                    newSeq.setPrefix(prefix);
                    newSeq.setCurrentSequence(startingSeq - 1);
                    newSeq.setSequenceLength(seqLength);
                    newSeq.setPattern(pattern);
                    return sequenceRepository.saveAndFlush(newSeq);
                });

        int nextVal = seq.getCurrentSequence() + 1;
        String code;
        while (true) {
            code = formatCode(pattern, orgCode, businessUnitId, nextVal, seqLength);
            if (employeeTwinRepository.existsByEmployeeCodeGlobal(code) <= 0) {
                break;
            }
            nextVal++;
        }
        seq.setCurrentSequence(nextVal);
        sequenceRepository.saveAndFlush(seq);

        return code;
    }

    @Transactional(readOnly = true)
    public String previewNextCode(UUID organizationId, UUID businessUnitId) {
        UUID targetOrgId = organizationId != null ? organizationId : UUID.nameUUIDFromBytes("default-org".getBytes());

        Organization org = organizationId != null ? organizationRepository.findById(organizationId).orElse(null) : null;
        String orgCode = org != null ? org.getCode() : "ORG";
        String pattern = org != null && org.getEmployeeCodePattern() != null ? org.getEmployeeCodePattern() : "{ORG}-{SEQ:6}";
        int seqLength = org != null && org.getSequenceLength() != null ? org.getSequenceLength() : 6;
        int startingSeq = org != null && org.getStartingSequenceNumber() != null ? org.getStartingSequenceNumber() : 1;

        int currentVal = sequenceRepository.findByOrganizationId(targetOrgId)
                .map(EmployeeCodeSequence::getCurrentSequence)
                .orElse(startingSeq - 1);

        return formatCode(pattern, orgCode, businessUnitId, currentVal + 1, seqLength);
    }

    @Transactional
    public void reserveCode(UUID organizationId, String code) {
        UUID targetOrgId = organizationId != null ? organizationId : UUID.nameUUIDFromBytes("default-org".getBytes());
        EmployeeCodeSequence seq = sequenceRepository.findByOrganizationIdForUpdate(targetOrgId)
                .orElseGet(() -> {
                    EmployeeCodeSequence newSeq = new EmployeeCodeSequence();
                    newSeq.setOrganizationId(targetOrgId);
                    newSeq.setCurrentSequence(0);
                    return sequenceRepository.saveAndFlush(newSeq);
                });

        // Try to extract a numeric sequence from the code
        Pattern pattern = Pattern.compile("(\\d+)$");
        Matcher matcher = pattern.matcher(code);
        if (matcher.find()) {
            try {
                int codeNum = Integer.parseInt(matcher.group(1));
                if (codeNum > seq.getCurrentSequence()) {
                    seq.setCurrentSequence(codeNum);
                    sequenceRepository.save(seq);
                    log.info("Reserved employee code sequence up to {} for org ID {}", codeNum, targetOrgId);
                }
            } catch (NumberFormatException e) {
                // ignore
            }
        }
    }

    @Transactional(readOnly = true)
    public boolean validateCodeUniqueness(String code) {
        return !employeeTwinRepository.existsByEmployeeCodeAndDeletedFalse(code);
    }

    private String formatCode(String patternStr, String orgCode, UUID businessUnitId, int sequence, int seqLength) {
        String result = patternStr.replace("{ORG}", orgCode);
        
        // Handle {BU} replacement
        if (result.contains("{BU}")) {
            String buCode = "BU";
            if (businessUnitId != null) {
                BusinessUnit bu = businessUnitRepository.findById(businessUnitId).orElse(null);
                if (bu != null) {
                    buCode = bu.getCode();
                }
            }
            result = result.replace("{BU}", buCode);
        }

        // Handle {YEAR} replacement
        result = result.replace("{YEAR}", String.valueOf(LocalDate.now().getYear()));

        // Handle {SEQ:N} or default {SEQ} replacement
        Pattern seqPattern = Pattern.compile("\\{SEQ:(\\d+)\\}");
        Matcher matcher = seqPattern.matcher(result);
        if (matcher.find()) {
            int length = Integer.parseInt(matcher.group(1));
            String padFormat = "%0" + length + "d";
            String paddedSequence = String.format(padFormat, sequence);
            result = matcher.replaceFirst(paddedSequence);
        } else if (result.contains("{SEQ}")) {
            String padFormat = "%0" + seqLength + "d";
            String paddedSequence = String.format(padFormat, sequence);
            result = result.replace("{SEQ}", paddedSequence);
        } else {
            // fallback
            String padFormat = "%0" + seqLength + "d";
            result = result + "-" + String.format(padFormat, sequence);
        }
        return result;
    }
}
