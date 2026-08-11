package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CbseExamTemplateService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final CbseExamTemplateRepository templateRepository;
    private final CbseExamTemplateRankRepository rankRepository;
    private final CbseExamRepository cbseExamRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (templateRepository.count() > 0) {
            return;
        }
        seedTemplates();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllTemplates() {
        return templateRepository.findAllByOrderByTemplateNameAsc().stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTemplateById(Long id) {
        return toDetailResponse(requireTemplate(id));
    }

    @Transactional
    public Map<String, Object> createTemplate(Map<String, Object> body) {
        CbseExamTemplate template = mapTemplate(new CbseExamTemplate(), body);
        validateTemplate(template, null);
        return toDetailResponse(templateRepository.save(template));
    }

    @Transactional
    public Map<String, Object> updateTemplate(Long id, Map<String, Object> body) {
        CbseExamTemplate template = requireTemplate(id);
        mapTemplate(template, body);
        validateTemplate(template, id);
        return toDetailResponse(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Template not found with ID: " + id);
        }
        rankRepository.deleteByTemplateId(id);
        templateRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTemplatePreview(Long id) {
        CbseExamTemplate template = requireTemplate(id);
        Map<String, Object> preview = new LinkedHashMap<>();
        preview.put("templateName", template.getTemplateName());
        preview.put("academicSession", "2026-27");
        preview.put("schoolName", defaultText(template.getSchoolName(), "School Name"));
        preview.put("examCenter", defaultText(template.getExamCenter(), "Main Campus"));
        preview.put("printingDate", defaultText(template.getPrintingDate(), "04/01/2026"));
        preview.put("subjects", previewSubjects());
        preview.put("attendance", Map.of("workingDays", 100, "daysPresent", 78, "percentage", "78.00"));
        preview.put("summary", Map.of(
                "overallMarks", "270.00/350",
                "percentage", "77.14",
                "grade", "C+",
                "rank", "1"
        ));
        preview.put("student", previewStudent());
        return preview;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLinkExamData(Long id) {
        CbseExamTemplate template = requireTemplate(id);
        List<CbseExam> exams = cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc();

        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (CbseExam exam : exams) {
            String term = exam.getTerm() != null && !exam.getTerm().isBlank() ? exam.getTerm() : "General";
            grouped.computeIfAbsent(term, key -> new ArrayList<>()).add(Map.of(
                    "id", exam.getId(),
                    "examName", exam.getExamName()
            ));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("templateId", template.getId());
        response.put("templateName", template.getTemplateName());
        response.put("marksheetLinkType", defaultText(template.getMarksheetLinkType(), "single_exam_without_term"));
        response.put("linkedExamId", template.getLinkedExamId());
        response.put("terms", grouped.entrySet().stream().map(entry -> Map.of(
                "termName", entry.getKey(),
                "exams", entry.getValue()
        )).toList());
        return response;
    }

    @Transactional
    public Map<String, Object> saveLinkedExam(Long id, Map<String, Object> body) {
        CbseExamTemplate template = requireTemplate(id);
        template.setMarksheetLinkType(text(body.get("marksheetLinkType")));
        template.setLinkedExamId(parseLong(body.get("linkedExamId")));
        templateRepository.save(template);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Exam linked successfully!");
        response.put("linkedExamId", template.getLinkedExamId());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRankData(Long id) {
        CbseExamTemplate template = requireTemplate(id);
        List<Map<String, Object>> rows = buildRankRows(template);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("templateId", template.getId());
        response.put("templateName", template.getTemplateName());
        response.put("rankGenerated", template.isRankGenerated());
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> generateRank(Long id) {
        CbseExamTemplate template = requireTemplate(id);
        rankRepository.deleteByTemplateId(id);

        List<StudentAdmission> students = findStudentsForTemplate(template);
        int rank = 1;
        for (StudentAdmission student : students) {
            rankRepository.save(CbseExamTemplateRank.builder()
                    .templateId(id)
                    .studentAdmissionId(student.getId())
                    .rankValue(rank++)
                    .build());
        }

        template.setRankGenerated(true);
        templateRepository.save(template);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Rank generated successfully!");
        response.put("rankGenerated", true);
        response.put("rows", buildRankRows(template));
        return response;
    }

    private List<Map<String, Object>> buildRankRows(CbseExamTemplate template) {
        Map<Long, Integer> rankMap = rankRepository.findByTemplateIdOrderByRankValueAscIdAsc(template.getId())
                .stream()
                .collect(Collectors.toMap(CbseExamTemplateRank::getStudentAdmissionId,
                        CbseExamTemplateRank::getRankValue, (a, b) -> a));

        List<StudentAdmission> students = findStudentsForTemplate(template);
        if (students.isEmpty()) {
            return demoRankRows(template);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo());
            row.put("studentName", fullName(student));
            row.put("className", classSectionLabel(student));
            row.put("fatherName", defaultText(student.getFatherName(), ""));
            row.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().format(US_DATE) : "");
            row.put("gender", student.getGender());
            row.put("mobileNumber", defaultText(student.getMobileNumber(), ""));
            row.put("rank", rankMap.get(student.getId()));
            rows.add(row);
        }
        return rows;
    }

    private List<StudentAdmission> findStudentsForTemplate(CbseExamTemplate template) {
        if (template.getClassId() == null) {
            return List.of();
        }
        List<String> sections = parseSections(template.getSectionsJson());
        if (sections.isEmpty()) {
            return studentAdmissionRepository.search(template.getClassId(), null, null, false, null);
        }
        LinkedHashSet<Long> seen = new LinkedHashSet<>();
        List<StudentAdmission> students = new ArrayList<>();
        for (String section : sections) {
            for (StudentAdmission student : studentAdmissionRepository.search(
                    template.getClassId(), section, null, false, null)) {
                if (seen.add(student.getId())) {
                    students.add(student);
                }
            }
        }
        return students;
    }

    private List<Map<String, Object>> demoRankRows(CbseExamTemplate template) {
        String classLabel = defaultText(template.getClassName(), "Class 1") + "(A)";
        return List.of(
                rankRow("A004", "Nisha", classLabel, "", "04/12/2017", "Female", "9898989898", 1),
                rankRow("A5466", "ANANTA PATEL", classLabel, "Ramesh Patel", "05/02/2015", "Male", "8787878787", 2),
                rankRow("002", "Sneha Patel", classLabel, "Ramesh Patel", "07/15/2016", "Female", "9090909090", 3)
        );
    }

    private Map<String, Object> rankRow(String admissionNo, String name, String className,
                                        String fatherName, String dob, String gender,
                                        String mobile, Integer rank) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("admissionNo", admissionNo);
        row.put("studentName", name);
        row.put("className", className);
        row.put("fatherName", fatherName);
        row.put("dateOfBirth", dob);
        row.put("gender", gender);
        row.put("mobileNumber", mobile);
        row.put("rank", rank);
        return row;
    }

    private Map<String, Object> previewStudent() {
        Map<String, Object> student = new LinkedHashMap<>();
        student.put("admissionNo", "1800011");
        student.put("studentName", "Hariom Yadav");
        student.put("fatherName", "Rajesh Yadav");
        student.put("motherName", "Sunita Yadav");
        student.put("schoolName", "Smart School");
        student.put("examCenter", "Main Campus");
        student.put("rollNo", "11");
        student.put("dateOfBirth", "05/20/2014");
        student.put("resultDate", "04/01/2026");
        return student;
    }

    private List<Map<String, Object>> previewSubjects() {
        return List.of(
                subjectRow("ENGLISH", "001", List.of("8", "9", "65", "82", "7", "8", "70", "85", "83.50", "c2", "1")),
                subjectRow("HINDI", "001", List.of("9", "8", "68", "85", "8", "7", "72", "87", "86.00", "B2", "2")),
                subjectRow("MATHEMATICS", "001", List.of("10", "9", "70", "89", "9", "8", "75", "92", "90.50", "B1", "1")),
                subjectRow("EVS", "001", List.of("7", "8", "60", "75", "7", "7", "68", "82", "78.50", "C1", "3")),
                subjectRow("COMPUTER", "001", List.of("9", "9", "72", "90", "8", "8", "74", "90", "90.00", "B1", "1"))
        );
    }

    private Map<String, Object> subjectRow(String name, String code, List<String> values) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("subjectName", name);
        row.put("subjectCode", code);
        row.put("values", values);
        return row;
    }

    private CbseExamTemplate requireTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with ID: " + id));
    }

    private CbseExamTemplate mapTemplate(CbseExamTemplate template, Map<String, Object> body) {
        template.setTemplateName(text(body.get("templateName")));
        template.setClassId(parseLong(body.get("classId")));
        template.setClassName(text(body.get("className")));
        template.setSectionsJson(writeSections(body.get("sections")));
        template.setClassSectionsLabel(buildClassSectionsLabel(template.getClassName(), body.get("sections")));
        template.setMarksheetType(defaultText(text(body.get("marksheetType")), "portrait"));
        template.setSchoolName(text(body.get("schoolName")));
        template.setExamCenter(text(body.get("examCenter")));
        template.setPrintingDate(text(body.get("printingDate")));
        template.setHeaderImage(text(body.get("headerImage")));
        template.setFooterText(text(body.get("footerText")));
        template.setLeftSign(text(body.get("leftSign")));
        template.setMiddleSign(text(body.get("middleSign")));
        template.setRightSign(text(body.get("rightSign")));
        template.setBackgroundImage(text(body.get("backgroundImage")));
        template.setTemplateDescription(text(body.get("templateDescription")));
        template.setMarksheetLinkType(text(body.get("marksheetLinkType")));
        if (body.containsKey("linkedExamId")) {
            template.setLinkedExamId(parseLong(body.get("linkedExamId")));
        }
        template.setShowStudentName(bool(body.get("showStudentName"), true));
        template.setShowFatherName(bool(body.get("showFatherName"), true));
        template.setShowMotherName(bool(body.get("showMotherName"), true));
        template.setShowAcademicSession(bool(body.get("showAcademicSession"), true));
        template.setShowAdmissionNo(bool(body.get("showAdmissionNo"), true));
        template.setShowRollNo(bool(body.get("showRollNo"), true));
        template.setShowPhoto(bool(body.get("showPhoto"), true));
        template.setShowClass(bool(body.get("showClass"), false));
        template.setShowSection(bool(body.get("showSection"), false));
        template.setShowDob(bool(body.get("showDob"), true));
        template.setShowTeacherRemark(bool(body.get("showTeacherRemark"), true));
        template.setShowSubjectNote(bool(body.get("showSubjectNote"), true));

        if (template.getClassId() != null && (template.getClassName() == null || template.getClassName().isBlank())) {
            schoolClassRepository.findById(template.getClassId())
                    .ifPresent(schoolClass -> template.setClassName(schoolClass.getName()));
        }
        return template;
    }

    private void validateTemplate(CbseExamTemplate template, Long excludeId) {
        if (template.getTemplateName().isBlank()) {
            throw new IllegalArgumentException("Template name is required");
        }
        boolean exists = excludeId == null
                ? templateRepository.existsByTemplateNameIgnoreCase(template.getTemplateName())
                : templateRepository.existsByTemplateNameIgnoreCaseAndIdNot(template.getTemplateName(), excludeId);
        if (exists) {
            throw new IllegalArgumentException("Template name already exists");
        }
    }

    private Map<String, Object> toListResponse(CbseExamTemplate template) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", template.getId());
        map.put("templateName", template.getTemplateName());
        map.put("classSections", defaultText(template.getClassSectionsLabel(), ""));
        map.put("templateDescription", template.getTemplateDescription());
        map.put("rankGenerated", template.isRankGenerated());
        return map;
    }

    private Map<String, Object> toDetailResponse(CbseExamTemplate template) {
        Map<String, Object> map = toListResponse(template);
        map.put("classId", template.getClassId());
        map.put("className", template.getClassName());
        map.put("sections", parseSections(template.getSectionsJson()));
        map.put("marksheetType", template.getMarksheetType());
        map.put("schoolName", template.getSchoolName());
        map.put("examCenter", template.getExamCenter());
        map.put("printingDate", template.getPrintingDate());
        map.put("headerImage", template.getHeaderImage());
        map.put("footerText", template.getFooterText());
        map.put("leftSign", template.getLeftSign());
        map.put("middleSign", template.getMiddleSign());
        map.put("rightSign", template.getRightSign());
        map.put("backgroundImage", template.getBackgroundImage());
        map.put("marksheetLinkType", template.getMarksheetLinkType());
        map.put("linkedExamId", template.getLinkedExamId());
        map.put("showStudentName", template.isShowStudentName());
        map.put("showFatherName", template.isShowFatherName());
        map.put("showMotherName", template.isShowMotherName());
        map.put("showAcademicSession", template.isShowAcademicSession());
        map.put("showAdmissionNo", template.isShowAdmissionNo());
        map.put("showRollNo", template.isShowRollNo());
        map.put("showPhoto", template.isShowPhoto());
        map.put("showClass", template.isShowClass());
        map.put("showSection", template.isShowSection());
        map.put("showDob", template.isShowDob());
        map.put("showTeacherRemark", template.isShowTeacherRemark());
        map.put("showSubjectNote", template.isShowSubjectNote());
        return map;
    }

    private String buildClassSectionsLabel(String className, Object sectionsObj) {
        List<String> sections = castStringList(sectionsObj);
        if (className == null || className.isBlank() || sections.isEmpty()) {
            return className != null ? className : "";
        }
        return className + ": " + String.join(", ", sections);
    }

    private String writeSections(Object sectionsObj) {
        List<String> sections = castStringList(sectionsObj);
        if (sections.isEmpty()) {
            return "[]";
        }
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < sections.size(); i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append('"').append(sections.get(i).replace("\\", "\\\\").replace("\"", "\\\"")).append('"');
        }
        builder.append(']');
        return builder.toString();
    }

    private List<String> parseSections(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        String trimmed = json.trim();
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
            return List.of();
        }
        String inner = trimmed.substring(1, trimmed.length() - 1).trim();
        if (inner.isEmpty()) {
            return List.of();
        }
        List<String> sections = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < inner.length(); i++) {
            char ch = inner.charAt(i);
            if (ch == '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (ch == ',' && !inQuotes) {
                addSectionToken(sections, current);
                current.setLength(0);
                continue;
            }
            current.append(ch);
        }
        addSectionToken(sections, current);
        return sections;
    }

    private void addSectionToken(List<String> sections, StringBuilder current) {
        String value = current.toString().trim();
        if (!value.isEmpty()) {
            sections.add(value);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> castStringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<String> result = new ArrayList<>();
        for (Object item : list) {
            if (item != null) {
                result.add(String.valueOf(item).trim());
            }
        }
        return result;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String classSectionLabel(StudentAdmission student) {
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
        return className + "(" + student.getSection() + ")";
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.valueOf(String.valueOf(value));
    }

    private boolean bool(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private void seedTemplates() {
        CbseExamTemplate template = CbseExamTemplate.builder()
                .templateName("CBSE Report Card Template - 2026")
                .classId(null)
                .className("Class 1")
                .sectionsJson("[\"A\",\"A\",\"B\",\"C\",\"D\"]")
                .classSectionsLabel("Class 1: A, A, B, C, D")
                .marksheetType("landscape")
                .schoolName("School Name")
                .examCenter("Main Campus")
                .printingDate("04/01/2026")
                .templateDescription("Monthly CBSE examination report card template")
                .marksheetLinkType("single_exam_without_term")
                .showStudentName(true)
                .showFatherName(true)
                .showMotherName(true)
                .showAcademicSession(true)
                .showAdmissionNo(true)
                .showRollNo(true)
                .showPhoto(true)
                .showClass(false)
                .showSection(false)
                .showDob(true)
                .showTeacherRemark(true)
                .showSubjectNote(true)
                .build();
        templateRepository.save(template);

        CbseExamTemplate progress = CbseExamTemplate.builder()
                .templateName("Student Progress Report")
                .className("Class 2")
                .sectionsJson("[\"A\",\"B\"]")
                .classSectionsLabel("Class 2: A, B")
                .marksheetType("portrait")
                .templateDescription("Student progress report template")
                .build();
        templateRepository.save(progress);
    }
}
