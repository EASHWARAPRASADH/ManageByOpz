package com.managemyopz.twin.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.managemyopz.orgdna.entity.Department;
import com.managemyopz.orgdna.entity.Designation;
import com.managemyopz.orgdna.entity.Location;
import com.managemyopz.orgdna.repository.DepartmentRepository;
import com.managemyopz.orgdna.repository.DesignationRepository;
import com.managemyopz.orgdna.repository.LocationRepository;
import com.managemyopz.orgdna.repository.GradeRepository;
import com.managemyopz.orgdna.repository.BandRepository;
import com.managemyopz.orgdna.repository.EmploymentTypeRepository;
import com.managemyopz.security.service.FieldSecurityService;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Employee Export Service — Generates CSV, Excel (.xlsx), and PDF exports
 * for the Employee Directory and Employee 360 profile modules.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeExportService {

    private final EmployeeTwinRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final LocationRepository locationRepository;
    private final GradeRepository gradeRepository;
    private final BandRepository bandRepository;
    private final EmploymentTypeRepository employmentTypeRepository;
    private final FieldSecurityService fieldSecurityService;

    private static final String[] EXPORT_COLUMNS = {
        "Employee Code", "Employee Name", "Department", "Designation",
        "Email", "Phone", "Employment Status", "Location", "Joining Date"
    };

    // ── Data Resolution ──────────────────────────────────────────

    /**
     * Fetches filtered employees for export based on query parameters.
     */
    public List<EmployeeTwin> getFilteredEmployees(
            List<UUID> ids, String search, String status,
            UUID locationId, UUID departmentId, UUID employmentTypeId,
            String sortBy, boolean showArchived) {

        String tenantId = TenantContext.getCurrentTenant();
        List<EmployeeTwin> employees;

        if (ids != null && !ids.isEmpty()) {
            employees = employeeRepository.findAllById(ids);
            employees = employees.stream()
                    .filter(e -> tenantId.equals(e.getTenantId()))
                    .collect(Collectors.toList());
        } else if (showArchived) {
            employees = employeeRepository.findAllByTenant(tenantId);
        } else {
            employees = employeeRepository.findAllActiveByTenant(tenantId);
        }

        // Apply filters
        if (search != null && !search.isBlank()) {
            String lc = search.toLowerCase();
            employees = employees.stream().filter(e ->
                (e.getFirstName() != null && e.getFirstName().toLowerCase().contains(lc)) ||
                (e.getLastName() != null && e.getLastName().toLowerCase().contains(lc)) ||
                (e.getEmployeeCode() != null && e.getEmployeeCode().toLowerCase().contains(lc)) ||
                (e.getWorkEmail() != null && e.getWorkEmail().toLowerCase().contains(lc))
            ).collect(Collectors.toList());
        }
        if (status != null && !status.isBlank()) {
            employees = employees.stream()
                .filter(e -> e.getEmploymentStatus() != null && e.getEmploymentStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());
        }
        if (locationId != null) {
            employees = employees.stream().filter(e -> locationId.equals(e.getLocationId())).collect(Collectors.toList());
        }
        if (departmentId != null) {
            employees = employees.stream().filter(e -> departmentId.equals(e.getDepartmentId())).collect(Collectors.toList());
        }
        if (employmentTypeId != null) {
            employees = employees.stream().filter(e -> employmentTypeId.equals(e.getEmploymentTypeId())).collect(Collectors.toList());
        }

        // Sort
        if (sortBy != null && !sortBy.isBlank()) {
            switch (sortBy.toLowerCase()) {
                case "name" -> employees.sort(Comparator.comparing(EmployeeTwin::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                case "code" -> employees.sort(Comparator.comparing(EmployeeTwin::getEmployeeCode, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                case "joining" -> employees.sort(Comparator.comparing(EmployeeTwin::getDateOfJoining, Comparator.nullsLast(Comparator.naturalOrder())));
                case "status" -> employees.sort(Comparator.comparing(e -> e.getEmploymentStatus() != null ? e.getEmploymentStatus().name() : "", Comparator.naturalOrder()));
            }
        }

        return employees;
    }

    // ── Name Resolution Helpers ──────────────────────────────────

    private Map<UUID, String> buildDepartmentMap() {
        Map<UUID, String> map = new HashMap<>();
        departmentRepository.findAll().forEach(d -> map.put(d.getId(), d.getName()));
        return map;
    }

    private Map<UUID, String> buildDesignationMap() {
        Map<UUID, String> map = new HashMap<>();
        designationRepository.findAll().forEach(d -> map.put(d.getId(), d.getName()));
        return map;
    }

    private Map<UUID, String> buildLocationMap() {
        Map<UUID, String> map = new HashMap<>();
        locationRepository.findAll().forEach(l -> map.put(l.getId(), l.getName()));
        return map;
    }

    private Map<UUID, String> buildGradeMap() {
        Map<UUID, String> map = new HashMap<>();
        gradeRepository.findAll().forEach(g -> map.put(g.getId(), g.getName()));
        return map;
    }

    private Map<UUID, String> buildBandMap() {
        Map<UUID, String> map = new HashMap<>();
        bandRepository.findAll().forEach(b -> map.put(b.getId(), b.getName()));
        return map;
    }

    private Map<UUID, String> buildEmploymentTypeMap() {
        Map<UUID, String> map = new HashMap<>();
        employmentTypeRepository.findAll().forEach(et -> map.put(et.getId(), et.getName()));
        return map;
    }

    private String safe(String val) {
        return val != null ? val : "";
    }

    private String formatDate(LocalDate d) {
        return d != null ? d.format(DateTimeFormatter.ISO_LOCAL_DATE) : "";
    }

    private String getFieldValue(EmployeeTwin emp, String fieldCategory, String rawValue, String username) {
        String accessLevel = fieldSecurityService.getAccessLevel(username, fieldCategory);
        if ("HIDDEN".equalsIgnoreCase(accessLevel)) {
            return "";
        } else if ("MASKED".equalsIgnoreCase(accessLevel)) {
            return maskString(rawValue);
        }
        return rawValue != null ? rawValue : "";
    }

    private String maskString(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        if (input.length() <= 4) {
            return "****";
        }
        return "****" + input.substring(input.length() - 4);
    }

    // ── CSV Export ──────────────────────────────────────────

    public byte[] exportCsv(List<EmployeeTwin> employees) throws IOException {
        Map<UUID, String> deptMap = buildDepartmentMap();
        Map<UUID, String> dsgMap = buildDesignationMap();
        Map<UUID, String> locMap = buildLocationMap();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(0xEF);
        baos.write(0xBB);
        baos.write(0xBF);

        try (OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
            writer.write(String.join(",", EXPORT_COLUMNS));
            writer.write("\n");

            for (EmployeeTwin emp : employees) {
                String[] row = {
                    csvEscape(safe(emp.getEmployeeCode())),
                    csvEscape(emp.getFullName()),
                    csvEscape(deptMap.getOrDefault(emp.getDepartmentId(), "")),
                    csvEscape(dsgMap.getOrDefault(emp.getDesignationId(), "")),
                    csvEscape(safe(emp.getWorkEmail())),
                    csvEscape(safe(emp.getWorkPhone())),
                    csvEscape(emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : ""),
                    csvEscape(locMap.getOrDefault(emp.getLocationId(), "")),
                    csvEscape(formatDate(emp.getDateOfJoining()))
                };
                writer.write(String.join(",", row));
                writer.write("\n");
            }
            writer.flush();
        }
        return baos.toByteArray();
    }

    private String csvEscape(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    // ── Excel Export ──────────────────────────────────────────

    public byte[] exportExcel(List<EmployeeTwin> employees, String companyName) throws IOException {
        Map<UUID, String> deptMap = buildDepartmentMap();
        Map<UUID, String> dsgMap = buildDesignationMap();
        Map<UUID, String> locMap = buildLocationMap();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employee Directory");

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(companyName != null ? companyName : "ManageMyTalenthive");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, EXPORT_COLUMNS.length - 1));

            CellStyle timestampStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font tsFont = workbook.createFont();
            tsFont.setItalic(true);
            tsFont.setFontHeightInPoints((short) 9);
            timestampStyle.setFont(tsFont);

            org.apache.poi.ss.usermodel.Row tsRow = sheet.createRow(1);
            org.apache.poi.ss.usermodel.Cell tsCell = tsRow.createCell(0);
            tsCell.setCellValue("Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            tsCell.setCellStyle(timestampStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, EXPORT_COLUMNS.length - 1));

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(3);
            for (int i = 0; i < EXPORT_COLUMNS.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(EXPORT_COLUMNS[i]);
                cell.setCellStyle(headerStyle);
            }

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setWrapText(false);

            int rowIdx = 4;
            for (EmployeeTwin emp : employees) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(safe(emp.getEmployeeCode()));
                row.createCell(1).setCellValue(emp.getFullName());
                row.createCell(2).setCellValue(deptMap.getOrDefault(emp.getDepartmentId(), ""));
                row.createCell(3).setCellValue(dsgMap.getOrDefault(emp.getDesignationId(), ""));
                row.createCell(4).setCellValue(safe(emp.getWorkEmail()));
                row.createCell(5).setCellValue(safe(emp.getWorkPhone()));
                row.createCell(6).setCellValue(emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "");
                row.createCell(7).setCellValue(locMap.getOrDefault(emp.getLocationId(), ""));
                row.createCell(8).setCellValue(formatDate(emp.getDateOfJoining()));
            }

            for (int i = 0; i < EXPORT_COLUMNS.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 3000) {
                    sheet.setColumnWidth(i, 3000);
                }
            }

            sheet.createFreezePane(0, 4);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    // ── PDF Export ──────────────────────────────────────────

    public byte[] exportPdf(List<EmployeeTwin> employees, String companyName, String generatedBy) {
        Map<UUID, String> deptMap = buildDepartmentMap();
        Map<UUID, String> dsgMap = buildDesignationMap();
        Map<UUID, String> locMap = buildLocationMap();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 54, 36);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter w, Document doc) {
                    PdfContentByte cb = w.getDirectContent();
                    Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);
                    Phrase footer = new Phrase("Page " + doc.getPageNumber(), footerFont);
                    ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                            (doc.right() - doc.left()) / 2 + doc.leftMargin(),
                            doc.bottom() - 18, 0);
                }
            });

            document.open();

            Font companyFont = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(30, 58, 138));
            Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.DARK_GRAY);
            Font metaFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);

            Paragraph company = new Paragraph(companyName != null ? companyName : "ManageMyTalenthive", companyFont);
            company.setAlignment(Element.ALIGN_CENTER);
            document.add(company);

            Paragraph title = new Paragraph("Employee Directory Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(4);
            document.add(title);

            Paragraph meta = new Paragraph(
                "Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                + "  |  By: " + (generatedBy != null ? generatedBy : "System")
                + "  |  Records: " + employees.size(),
                metaFont
            );
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingBefore(2);
            meta.setSpacingAfter(12);
            document.add(meta);

            PdfPTable table = new PdfPTable(EXPORT_COLUMNS.length);
            table.setWidthPercentage(100);
            table.setSpacingBefore(6);

            float[] widths = {10f, 15f, 12f, 12f, 18f, 10f, 9f, 10f, 9f};
            table.setWidths(widths);

            Font headerFont = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
            Color headerBg = new Color(30, 58, 138);
            for (String col : EXPORT_COLUMNS) {
                PdfPCell cell = new PdfPCell(new Phrase(col, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBorderColor(Color.WHITE);
                table.addCell(cell);
            }

            Font dataFont = new Font(Font.HELVETICA, 7, Font.NORMAL, Color.DARK_GRAY);
            Color altRow = new Color(241, 245, 249);
            int idx = 0;
            for (EmployeeTwin emp : employees) {
                Color bg = (idx % 2 == 0) ? Color.WHITE : altRow;

                String[] values = {
                    safe(emp.getEmployeeCode()),
                    emp.getFullName(),
                    deptMap.getOrDefault(emp.getDepartmentId(), ""),
                    dsgMap.getOrDefault(emp.getDesignationId(), ""),
                    safe(emp.getWorkEmail()),
                    safe(emp.getWorkPhone()),
                    emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "",
                    locMap.getOrDefault(emp.getLocationId(), ""),
                    formatDate(emp.getDateOfJoining())
                };

                for (String val : values) {
                    PdfPCell cell = new PdfPCell(new Phrase(val, dataFont));
                    cell.setBackgroundColor(bg);
                    cell.setPadding(5);
                    cell.setBorderColor(new Color(226, 232, 240));
                    table.addCell(cell);
                }
                idx++;
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            log.error("PDF generation failed", e);
            throw new RuntimeException("PDF generation failed", e);
        }

        return baos.toByteArray();
    }

    // ── PART 1: Employee 360 Profile Export Implementations ──────────────────

    public byte[] exportProfileCsv(EmployeeTwin emp, String username) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(0xEF);
        baos.write(0xBB);
        baos.write(0xBF);

        try (OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
            writer.write("\"Section\",\"Field\",\"Value\"\n");

            // Personal Information
            writer.write(csvLine("Personal Information", "Employee Code", emp.getEmployeeCode()));
            writer.write(csvLine("Personal Information", "First Name", emp.getFirstName()));
            writer.write(csvLine("Personal Information", "Middle Name", emp.getMiddleName()));
            writer.write(csvLine("Personal Information", "Last Name", emp.getLastName()));
            writer.write(csvLine("Personal Information", "Display Name", emp.getDisplayName()));
            writer.write(csvLine("Personal Information", "Date of Birth", formatDate(emp.getDateOfBirth())));
            writer.write(csvLine("Personal Information", "Gender", emp.getGender()));
            writer.write(csvLine("Personal Information", "Nationality", emp.getNationality()));
            writer.write(csvLine("Personal Information", "Marital Status", emp.getMaritalStatus()));
            writer.write(csvLine("Personal Information", "Blood Group", emp.getBloodGroup()));
            writer.write(csvLine("Personal Information", "Preferred Language", emp.getPreferredLanguage()));

            // Contact
            writer.write(csvLine("Contact Information", "Work Email", emp.getWorkEmail()));
            writer.write(csvLine("Contact Information", "Personal Email", emp.getPersonalEmail()));
            writer.write(csvLine("Contact Information", "Work Phone", emp.getWorkPhone()));
            writer.write(csvLine("Contact Information", "Personal Phone", emp.getPersonalPhone()));
            writer.write(csvLine("Contact Information", "Current Address", emp.getCurrentAddress()));
            writer.write(csvLine("Contact Information", "Permanent Address", emp.getPermanentAddress()));

            // Emergency Contacts
            writer.write(csvLine("Emergency Contacts", "Name", emp.getEmergencyContactName()));
            writer.write(csvLine("Emergency Contacts", "Phone", emp.getEmergencyContactPhone()));
            writer.write(csvLine("Emergency Contacts", "Relation", emp.getEmergencyContactRelation()));

            // Employment DNA
            Map<UUID, String> deptMap = buildDepartmentMap();
            Map<UUID, String> dsgMap = buildDesignationMap();
            Map<UUID, String> locMap = buildLocationMap();
            Map<UUID, String> gradeMap = buildGradeMap();
            Map<UUID, String> bandMap = buildBandMap();
            Map<UUID, String> empTypeMap = buildEmploymentTypeMap();

            writer.write(csvLine("Employment Information", "Department", emp.getDepartmentId() != null ? deptMap.get(emp.getDepartmentId()) : ""));
            writer.write(csvLine("Employment Information", "Designation", emp.getDesignationId() != null ? dsgMap.get(emp.getDesignationId()) : ""));
            writer.write(csvLine("Employment Information", "Location", emp.getLocationId() != null ? locMap.get(emp.getLocationId()) : ""));
            writer.write(csvLine("Employment Information", "Grade", emp.getGradeId() != null ? gradeMap.get(emp.getGradeId()) : ""));
            writer.write(csvLine("Employment Information", "Band", emp.getBandId() != null ? bandMap.get(emp.getBandId()) : ""));
            writer.write(csvLine("Employment Information", "Employment Type", emp.getEmploymentTypeId() != null ? empTypeMap.get(emp.getEmploymentTypeId()) : ""));
            writer.write(csvLine("Employment Information", "Joining Date", formatDate(emp.getDateOfJoining())));
            writer.write(csvLine("Employment Information", "Employment Status", emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : ""));

            String managerName = "";
            if (emp.getManagerId() != null) {
                managerName = employeeRepository.findById(emp.getManagerId()).map(EmployeeTwin::getFullName).orElse("");
            }
            writer.write(csvLine("Employment Information", "Manager", managerName));

            // Compliance
            writer.write(csvLine("Compliance Info", "PAN Number", getFieldValue(emp, "pan_number", emp.getPanNumber(), username)));
            writer.write(csvLine("Compliance Info", "Aadhaar Number", getFieldValue(emp, "aadhaar_number", emp.getAadhaarNumber(), username)));
            writer.write(csvLine("Compliance Info", "UAN Number", getFieldValue(emp, "uan_number", emp.getUanNumber(), username)));
            writer.write(csvLine("Compliance Info", "ESIC Number", getFieldValue(emp, "esic_number", emp.getEsicNumber(), username)));
            writer.write(csvLine("Compliance Info", "Passport Number", getFieldValue(emp, "passport", emp.getPassportNumber(), username)));

            // Banking
            writer.write(csvLine("Banking Info", "Bank Name", getFieldValue(emp, "bank_account", emp.getBankName(), username)));
            writer.write(csvLine("Banking Info", "Account Number", getFieldValue(emp, "bank_account", emp.getBankAccountNumber(), username)));
            writer.write(csvLine("Banking Info", "IFSC Code", getFieldValue(emp, "bank_account", emp.getBankIfsc(), username)));
            writer.write(csvLine("Banking Info", "Branch Name", getFieldValue(emp, "bank_account", emp.getBankBranch(), username)));

            // Skills
            if (emp.getSkills() != null && !emp.getSkills().isEmpty()) {
                for (var skill : emp.getSkills()) {
                    writer.write(csvLine("Skills", skill.getSkillName(),
                        "Category: " + safe(skill.getSkillCategory()) + 
                        ", Level: " + safe(skill.getProficiencyLevel()) + 
                        ", Exp: " + (skill.getYearsOfExperience() != null ? skill.getYearsOfExperience() : 0.0) + " years"));
                }
            }

            // Certifications
            if (emp.getCertifications() != null && !emp.getCertifications().isEmpty()) {
                for (var cert : emp.getCertifications()) {
                    writer.write(csvLine("Certifications", cert.getCertificationName(),
                        "Authority: " + safe(cert.getIssuingAuthority()) + 
                        ", Credential ID: " + safe(cert.getCredentialId()) + 
                        ", Expiry: " + formatDate(cert.getExpiryDate())));
                }
            }

            // Documents
            if (emp.getDocuments() != null && !emp.getDocuments().isEmpty()) {
                for (var doc : emp.getDocuments()) {
                    writer.write(csvLine("Documents", doc.getDocumentName(),
                        "Type: " + safe(doc.getDocumentType()) + 
                        ", Status: " + (doc.getVerificationStatus() != null ? doc.getVerificationStatus().name() : "PENDING")));
                }
            }

            // Timeline
            if (emp.getTimeline() != null && !emp.getTimeline().isEmpty()) {
                for (var event : emp.getTimeline()) {
                    writer.write(csvLine("Timeline", formatDate(event.getEventDate()),
                        "[" + event.getEventType().name() + "] " + safe(event.getTitle()) + " - " + safe(event.getDescription())));
                }
            }
            writer.flush();
        }
        return baos.toByteArray();
    }

    private String csvLine(String section, String field, String value) {
        return String.format("\"%s\",\"%s\",\"%s\"\n", 
            escapeCsv(section), escapeCsv(field), escapeCsv(value));
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        return input.replace("\"", "\"\"");
    }

    public byte[] exportProfileExcel(EmployeeTwin emp, String companyName, String username) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Profile");
            sheet.createFreezePane(0, 1);

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle sectionStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font sectionFont = workbook.createFont();
            sectionFont.setBold(true);
            sectionFont.setFontHeightInPoints((short) 11);
            sectionStyle.setFont(sectionFont);
            sectionStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle boldStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            CellStyle normalStyle = workbook.createCellStyle();
            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int rowIdx = 0;

            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(rowIdx++);
            var cell = titleRow.createCell(0);
            cell.setCellValue("Employee Profile: " + emp.getFullName() + " (" + emp.getEmployeeCode() + ")");
            cell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 2));

            sheet.createRow(rowIdx++);

            class LocalWriter {
                int r = 2;
                boolean alt = false;

                void writeSection(String name) {
                    org.apache.poi.ss.usermodel.Row sRow = sheet.createRow(r++);
                    var c = sRow.createCell(0);
                    c.setCellValue(name);
                    c.setCellStyle(sectionStyle);
                    sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(r-1, r-1, 0, 2));
                    alt = false;
                }

                void writeRow(String field, String value) {
                    org.apache.poi.ss.usermodel.Row row = sheet.createRow(r++);
                    var c0 = row.createCell(0);
                    c0.setCellValue(field);
                    c0.setCellStyle(boldStyle);

                    var c1 = row.createCell(1);
                    c1.setCellValue(value != null ? value : "");
                    c1.setCellStyle(alt ? altStyle : normalStyle);
                    alt = !alt;
                }
            }

            LocalWriter helper = new LocalWriter();

            // Personal Information
            helper.writeSection("Personal Information");
            helper.writeRow("Employee Code", emp.getEmployeeCode());
            helper.writeRow("Full Name", emp.getFullName());
            helper.writeRow("Display Name", emp.getDisplayName());
            helper.writeRow("Date of Birth", formatDate(emp.getDateOfBirth()));
            helper.writeRow("Gender", emp.getGender());
            helper.writeRow("Nationality", emp.getNationality());
            helper.writeRow("Marital Status", emp.getMaritalStatus());
            helper.writeRow("Blood Group", emp.getBloodGroup());
            helper.writeRow("Preferred Language", emp.getPreferredLanguage());

            // Contact
            helper.writeSection("Contact Information");
            helper.writeRow("Work Email", emp.getWorkEmail());
            helper.writeRow("Personal Email", emp.getPersonalEmail());
            helper.writeRow("Work Phone", emp.getWorkPhone());
            helper.writeRow("Personal Phone", emp.getPersonalPhone());
            helper.writeRow("Current Address", emp.getCurrentAddress());
            helper.writeRow("Permanent Address", emp.getPermanentAddress());

            // Emergency Contacts
            helper.writeSection("Emergency Contacts");
            helper.writeRow("Contact Name", emp.getEmergencyContactName());
            helper.writeRow("Contact Phone", emp.getEmergencyContactPhone());
            helper.writeRow("Relation", emp.getEmergencyContactRelation());

            // EmploymentDNA
            Map<UUID, String> deptMap = buildDepartmentMap();
            Map<UUID, String> dsgMap = buildDesignationMap();
            Map<UUID, String> locMap = buildLocationMap();
            Map<UUID, String> gradeMap = buildGradeMap();
            Map<UUID, String> bandMap = buildBandMap();
            Map<UUID, String> empTypeMap = buildEmploymentTypeMap();

            helper.writeSection("Employment Information");
            helper.writeRow("Department", emp.getDepartmentId() != null ? deptMap.get(emp.getDepartmentId()) : "");
            helper.writeRow("Designation", emp.getDesignationId() != null ? dsgMap.get(emp.getDesignationId()) : "");
            helper.writeRow("Location", emp.getLocationId() != null ? locMap.get(emp.getLocationId()) : "");
            helper.writeRow("Grade", emp.getGradeId() != null ? gradeMap.get(emp.getGradeId()) : "");
            helper.writeRow("Band", emp.getBandId() != null ? bandMap.get(emp.getBandId()) : "");
            helper.writeRow("Employment Type", emp.getEmploymentTypeId() != null ? empTypeMap.get(emp.getEmploymentTypeId()) : "");
            helper.writeRow("Joining Date", formatDate(emp.getDateOfJoining()));
            helper.writeRow("Employment Status", emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "");

            String managerName = "";
            if (emp.getManagerId() != null) {
                managerName = employeeRepository.findById(emp.getManagerId()).map(EmployeeTwin::getFullName).orElse("");
            }
            helper.writeRow("Manager", managerName);

            // Compliance
            helper.writeSection("Compliance Information");
            helper.writeRow("PAN Number", getFieldValue(emp, "pan_number", emp.getPanNumber(), username));
            helper.writeRow("Aadhaar Number", getFieldValue(emp, "aadhaar_number", emp.getAadhaarNumber(), username));
            helper.writeRow("UAN Number", getFieldValue(emp, "uan_number", emp.getUanNumber(), username));
            helper.writeRow("ESIC Number", getFieldValue(emp, "esic_number", emp.getEsicNumber(), username));
            helper.writeRow("Passport Number", getFieldValue(emp, "passport", emp.getPassportNumber(), username));

            // Banking
            helper.writeSection("Banking Information");
            helper.writeRow("Bank Name", getFieldValue(emp, "bank_account", emp.getBankName(), username));
            helper.writeRow("Account Number", getFieldValue(emp, "bank_account", emp.getBankAccountNumber(), username));
            helper.writeRow("IFSC Code", getFieldValue(emp, "bank_account", emp.getBankIfsc(), username));
            helper.writeRow("Branch Name", getFieldValue(emp, "bank_account", emp.getBankBranch(), username));

            // Skills
            if (emp.getSkills() != null && !emp.getSkills().isEmpty()) {
                helper.writeSection("Skills");
                for (var skill : emp.getSkills()) {
                    helper.writeRow(skill.getSkillName(),
                        "Category: " + safe(skill.getSkillCategory()) + 
                        " | Level: " + safe(skill.getProficiencyLevel()) + 
                        " | Experience: " + (skill.getYearsOfExperience() != null ? skill.getYearsOfExperience() : 0.0) + " years");
                }
            }

            // Certifications
            if (emp.getCertifications() != null && !emp.getCertifications().isEmpty()) {
                helper.writeSection("Certifications");
                for (var cert : emp.getCertifications()) {
                    helper.writeRow(cert.getCertificationName(),
                        "Authority: " + safe(cert.getIssuingAuthority()) + 
                        " | ID: " + safe(cert.getCredentialId()) + 
                        " | Expiry: " + formatDate(cert.getExpiryDate()));
                }
            }

            // Documents
            if (emp.getDocuments() != null && !emp.getDocuments().isEmpty()) {
                helper.writeSection("Documents");
                for (var doc : emp.getDocuments()) {
                    helper.writeRow(doc.getDocumentName(),
                        "Type: " + safe(doc.getDocumentType()) + 
                        " | Status: " + (doc.getVerificationStatus() != null ? doc.getVerificationStatus().name() : "PENDING"));
                }
            }

            // Timeline
            if (emp.getTimeline() != null && !emp.getTimeline().isEmpty()) {
                helper.writeSection("Timeline Summary");
                for (var event : emp.getTimeline()) {
                    helper.writeRow(formatDate(event.getEventDate()),
                        "[" + event.getEventType().name() + "] " + safe(event.getTitle()) + " - " + safe(event.getDescription()));
                }
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] exportProfilePdf(EmployeeTwin emp, String companyName, String generatedBy, String username) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 54);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter w, Document doc) {
                    PdfContentByte cb = w.getDirectContent();
                    Phrase footer = new Phrase("Generated by ManageMyTalentHive  |  Page " + doc.getPageNumber(), footerFont);
                    ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                            (doc.right() - doc.left()) / 2 + doc.leftMargin(),
                            doc.bottom() - 18, 0);
                }
            });

            document.open();

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(79, 70, 229));
            Font sectionHeaderFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(15, 23, 42));
            Font fieldLabelFont = new Font(Font.HELVETICA, 8, Font.BOLD, new Color(71, 85, 105));
            Font fieldValueFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(15, 23, 42));
            Font headerLabelFont = new Font(Font.HELVETICA, 7, Font.BOLD, Color.WHITE);
            Font tableFont = new Font(Font.HELVETICA, 7, Font.NORMAL, Color.DARK_GRAY);

            // ── Header Row ──
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60f, 40f});
            
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            Paragraph logoPara = new Paragraph(companyName != null ? companyName : "ManageMyTalentHive", titleFont);
            leftCell.addElement(logoPara);
            Paragraph subLogo = new Paragraph("Enterprise Human Resource Profile Report", new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY));
            leftCell.addElement(subLogo);
            headerTable.addCell(leftCell);

            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            
            Paragraph empNamePara = new Paragraph(emp.getFullName(), new Font(Font.HELVETICA, 12, Font.BOLD, Color.DARK_GRAY));
            empNamePara.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(empNamePara);
            
            Paragraph empCodePara = new Paragraph("Code: " + emp.getEmployeeCode(), new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY));
            empCodePara.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(empCodePara);
            
            Paragraph datePara = new Paragraph("Generated: " + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + " (" + generatedBy + ")", new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY));
            datePara.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(datePara);
            
            headerTable.addCell(rightCell);
            document.add(headerTable);

            // Divider Line
            Paragraph line = new Paragraph();
            line.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100f, new Color(226, 232, 240), Element.ALIGN_CENTER, -2)));
            line.setSpacingAfter(10);
            document.add(line);

            // ── Section 1: Personal Information ──
            document.add(new Paragraph("Personal Information", sectionHeaderFont));
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2))); // Spacing

            PdfPTable personalTable = new PdfPTable(4);
            personalTable.setWidthPercentage(100);
            personalTable.setWidths(new float[]{25f, 25f, 25f, 25f});
            
            addField(personalTable, "Employee Code", emp.getEmployeeCode(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Full Name", emp.getFullName(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Display Name", emp.getDisplayName(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Date of Birth", formatDate(emp.getDateOfBirth()), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Gender", emp.getGender(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Nationality", emp.getNationality(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Marital Status", emp.getMaritalStatus(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Blood Group", emp.getBloodGroup(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "Language", emp.getPreferredLanguage(), fieldLabelFont, fieldValueFont);
            addField(personalTable, "", "", fieldLabelFont, fieldValueFont);
            
            document.add(personalTable);
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));

            // ── Section 2: Contact Information ──
            document.add(new Paragraph("Contact & Emergency Information", sectionHeaderFont));
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

            PdfPTable contactTable = new PdfPTable(4);
            contactTable.setWidthPercentage(100);
            contactTable.setWidths(new float[]{25f, 25f, 25f, 25f});

            addField(contactTable, "Work Email", emp.getWorkEmail(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Personal Email", emp.getPersonalEmail(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Work Phone", emp.getWorkPhone(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Personal Phone", emp.getPersonalPhone(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Current Address", emp.getCurrentAddress(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Permanent Address", emp.getPermanentAddress(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Emergency Contact", emp.getEmergencyContactName(), fieldLabelFont, fieldValueFont);
            addField(contactTable, "Emergency Phone", emp.getEmergencyContactPhone(), fieldLabelFont, fieldValueFont);

            document.add(contactTable);
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));

            // ── Section 3: Employment DNA ──
            document.add(new Paragraph("Employment DNA", sectionHeaderFont));
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

            PdfPTable empTable = new PdfPTable(4);
            empTable.setWidthPercentage(100);
            empTable.setWidths(new float[]{25f, 25f, 25f, 25f});

            Map<UUID, String> deptMap = buildDepartmentMap();
            Map<UUID, String> dsgMap = buildDesignationMap();
            Map<UUID, String> locMap = buildLocationMap();
            Map<UUID, String> gradeMap = buildGradeMap();
            Map<UUID, String> bandMap = buildBandMap();
            Map<UUID, String> empTypeMap = buildEmploymentTypeMap();

            addField(empTable, "Department", emp.getDepartmentId() != null ? deptMap.get(emp.getDepartmentId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Designation", emp.getDesignationId() != null ? dsgMap.get(emp.getDesignationId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Location", emp.getLocationId() != null ? locMap.get(emp.getLocationId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Grade", emp.getGradeId() != null ? gradeMap.get(emp.getGradeId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Band", emp.getBandId() != null ? bandMap.get(emp.getBandId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Employment Type", emp.getEmploymentTypeId() != null ? empTypeMap.get(emp.getEmploymentTypeId()) : "", fieldLabelFont, fieldValueFont);
            addField(empTable, "Joining Date", formatDate(emp.getDateOfJoining()), fieldLabelFont, fieldValueFont);
            addField(empTable, "Status", emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "", fieldLabelFont, fieldValueFont);

            String managerName = "";
            if (emp.getManagerId() != null) {
                managerName = employeeRepository.findById(emp.getManagerId()).map(EmployeeTwin::getFullName).orElse("");
            }
            addField(empTable, "Manager", managerName, fieldLabelFont, fieldValueFont);
            addField(empTable, "", "", fieldLabelFont, fieldValueFont);

            document.add(empTable);
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));

            // ── Section 4: Compliance & Banking ──
            document.add(new Paragraph("Compliance & Banking Information", sectionHeaderFont));
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

            PdfPTable compTable = new PdfPTable(4);
            compTable.setWidthPercentage(100);
            compTable.setWidths(new float[]{25f, 25f, 25f, 25f});

            addField(compTable, "PAN Number", getFieldValue(emp, "pan_number", emp.getPanNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "Aadhaar Number", getFieldValue(emp, "aadhaar_number", emp.getAadhaarNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "UAN Number", getFieldValue(emp, "uan_number", emp.getUanNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "ESIC Number", getFieldValue(emp, "esic_number", emp.getEsicNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "Passport Number", getFieldValue(emp, "passport", emp.getPassportNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "Bank Name", getFieldValue(emp, "bank_account", emp.getBankName(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "Account Number", getFieldValue(emp, "bank_account", emp.getBankAccountNumber(), username), fieldLabelFont, fieldValueFont);
            addField(compTable, "IFSC Code", getFieldValue(emp, "bank_account", emp.getBankIfsc(), username), fieldLabelFont, fieldValueFont);

            document.add(compTable);
            document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));

            // ── Section 5: Skills ──
            if (emp.getSkills() != null && !emp.getSkills().isEmpty()) {
                document.add(new Paragraph("Skills", sectionHeaderFont));
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

                PdfPTable skillsTable = new PdfPTable(3);
                skillsTable.setWidthPercentage(100);
                skillsTable.setWidths(new float[]{40f, 30f, 30f});

                addTableHeaderCell(skillsTable, "Skill Name", headerLabelFont);
                addTableHeaderCell(skillsTable, "Category", headerLabelFont);
                addTableHeaderCell(skillsTable, "Proficiency Level & Experience", headerLabelFont);

                for (var skill : emp.getSkills()) {
                    skillsTable.addCell(createTableCell(skill.getSkillName(), tableFont));
                    skillsTable.addCell(createTableCell(skill.getSkillCategory(), tableFont));
                    skillsTable.addCell(createTableCell(safe(skill.getProficiencyLevel()) + " (" + (skill.getYearsOfExperience() != null ? skill.getYearsOfExperience() : 0.0) + " yrs)", tableFont));
                }
                document.add(skillsTable);
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));
            }

            // ── Section 6: Certifications ──
            if (emp.getCertifications() != null && !emp.getCertifications().isEmpty()) {
                document.add(new Paragraph("Certifications", sectionHeaderFont));
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

                PdfPTable certTable = new PdfPTable(3);
                certTable.setWidthPercentage(100);
                certTable.setWidths(new float[]{40f, 30f, 30f});

                addTableHeaderCell(certTable, "Certification Name", headerLabelFont);
                addTableHeaderCell(certTable, "Issuing Authority", headerLabelFont);
                addTableHeaderCell(certTable, "Credential ID & Expiry", headerLabelFont);

                for (var cert : emp.getCertifications()) {
                    certTable.addCell(createTableCell(cert.getCertificationName(), tableFont));
                    certTable.addCell(createTableCell(cert.getIssuingAuthority(), tableFont));
                    certTable.addCell(createTableCell(safe(cert.getCredentialId()) + " (Exp: " + formatDate(cert.getExpiryDate()) + ")", tableFont));
                }
                document.add(certTable);
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));
            }

            // ── Section 7: Documents ──
            if (emp.getDocuments() != null && !emp.getDocuments().isEmpty()) {
                document.add(new Paragraph("Documents", sectionHeaderFont));
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

                PdfPTable docTable = new PdfPTable(3);
                docTable.setWidthPercentage(100);
                docTable.setWidths(new float[]{50f, 30f, 20f});

                addTableHeaderCell(docTable, "Document Name", headerLabelFont);
                addTableHeaderCell(docTable, "Category/Type", headerLabelFont);
                addTableHeaderCell(docTable, "Verification Status", headerLabelFont);

                for (var doc : emp.getDocuments()) {
                    docTable.addCell(createTableCell(doc.getDocumentName(), tableFont));
                    docTable.addCell(createTableCell(doc.getDocumentType(), tableFont));
                    docTable.addCell(createTableCell(doc.getVerificationStatus() != null ? doc.getVerificationStatus().name() : "PENDING", tableFont));
                }
                document.add(docTable);
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 6)));
            }

            // ── Section 8: Timeline Summary ──
            if (emp.getTimeline() != null && !emp.getTimeline().isEmpty()) {
                document.add(new Paragraph("Timeline Summary", sectionHeaderFont));
                document.add(new Paragraph(" ", new Font(Font.HELVETICA, 2)));

                PdfPTable timelineTable = new PdfPTable(3);
                timelineTable.setWidthPercentage(100);
                timelineTable.setWidths(new float[]{20f, 30f, 50f});

                addTableHeaderCell(timelineTable, "Event Date", headerLabelFont);
                addTableHeaderCell(timelineTable, "Title", headerLabelFont);
                addTableHeaderCell(timelineTable, "Description", headerLabelFont);

                for (var event : emp.getTimeline()) {
                    timelineTable.addCell(createTableCell(formatDate(event.getEventDate()), tableFont));
                    timelineTable.addCell(createTableCell(event.getTitle(), tableFont));
                    timelineTable.addCell(createTableCell(event.getDescription(), tableFont));
                }
                document.add(timelineTable);
            }

            document.close();
        } catch (DocumentException e) {
            log.error("PDF generation failed", e);
            throw new RuntimeException("PDF generation failed", e);
        }

        return baos.toByteArray();
    }

    private void addField(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valCell = new PdfPCell(new Phrase(value != null ? value : "", valueFont));
        valCell.setBorder(Rectangle.NO_BORDER);
        valCell.setPadding(4);
        table.addCell(valCell);
    }

    private void addTableHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(79, 70, 229));
        cell.setPadding(5);
        cell.setBorderColor(Color.WHITE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private PdfPCell createTableCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(4);
        cell.setBorderColor(new Color(226, 232, 240));
        return cell;
    }
}
