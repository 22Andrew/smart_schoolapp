package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CbseExamService implements ApplicationRunner {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final CbseExamRepository cbseExamRepository;
    private final CbseExamSubjectRepository cbseExamSubjectRepository;
    private final CbseExamStudentRepository cbseExamStudentRepository;
    private final CbseExamRankRepository cbseExamRankRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final JdbcTemplate jdbcTemplate;
    private final CbseExamCategoryService cbseExamCategoryService;
    private final CbseExamGradeService cbseExamGradeService;
    private final CbseExamAssessmentService cbseExamAssessmentService;
    private final CbseExamTermService cbseExamTermService;
    public static final List<String> SUBJECTS = List.of(
            "English (210)", "Mathematics (110)", "Science (111)",
            "Hindi (212)", "Social Science (113)", "Computer (114)"
    );
    public static final List<String> SUBJECT_ASSESSMENTS = List.of("Theory (TH02)", "Practical (PC03)", "Assignment (AS01)");
    public static final List<String> MAIL_TEMPLATES = List.of("Select", "Exam Notification", "Result Notification");

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateRankColumnIfNeeded();
        if (cbseExamRepository.count() > 0) {
            return;
        }
        seedExams();
    }

    private void migrateRankColumnIfNeeded() {
        try {
            Integer legacyRankColumn = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cbse_exam_ranks' AND COLUMN_NAME = 'rank'",
                    Integer.class);
            if (legacyRankColumn != null && legacyRankColumn > 0) {
                jdbcTemplate.execute("ALTER TABLE cbse_exam_ranks CHANGE `rank` student_rank INT NOT NULL");
            }
        } catch (Exception ignored) {
            // Table may not exist yet; Hibernate will create it with student_rank.
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllExams() {
        return cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamTimetables() {
        return cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(exam -> {
                    Map<String, Object> group = new LinkedHashMap<>();
                    group.put("id", exam.getId());
                    group.put("examName", exam.getExamName());
                    group.put("published", exam.isPublished());
                    group.put("subjects", cbseExamSubjectRepository.findByCbseExamIdOrderByIdAsc(exam.getId()).stream()
                            .map(this::toSubjectResponse)
                            .toList());
                    return group;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFormOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("terms", cbseExamTermService.getTermDisplayNames());
        options.put("classes", loadClassesFromDb());
        options.put("assessments", cbseExamAssessmentService.getAssessmentNames());
        options.put("grades", cbseExamGradeService.getGradeTitles());
        options.put("categories", cbseExamCategoryService.getCategoryNames());
        options.put("subjects", SUBJECTS);
        options.put("subjectAssessments", SUBJECT_ASSESSMENTS);
        options.put("mailTemplates", MAIL_TEMPLATES);
        return options;
    }

    @Transactional
    public Map<String, Object> saveExam(Map<String, Object> body) {
        CbseExam exam = mapExam(new CbseExam(), body);
        validateExam(exam);
        return toListResponse(cbseExamRepository.save(exam));
    }

    @Transactional
    public Map<String, Object> updateExam(Long id, Map<String, Object> body) {
        CbseExam exam = cbseExamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + id));
        mapExam(exam, body);
        validateExam(exam);
        return toListResponse(cbseExamRepository.save(exam));
    }

    @Transactional
    public void deleteExam(Long id) {
        if (!cbseExamRepository.existsById(id)) {
            throw new RuntimeException("Exam not found with ID: " + id);
        }
        cbseExamRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExamDetails(Long id) {
        CbseExam exam = requireExam(id);
        Map<String, Object> map = toListResponse(exam);
        map.put("admitCardRollType", exam.getAdmitCardRollType());
        map.put("mailTemplate", exam.getMailTemplate());
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssignableStudents(Long examId, Long classId, String section) {
        CbseExam exam = requireExam(examId);
        Long resolvedClassId = classId != null ? classId : resolveClassId(exam.getClassName());
        String resolvedSection = section != null && !section.isBlank()
                ? section.trim()
                : exam.getSections().split(",")[0].trim();

        List<StudentAdmission> students = studentAdmissionRepository.search(
                resolvedClassId, resolvedSection, null, false, null);

        Set<Long> assignedIds = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(examId).stream()
                .map(CbseExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        return students.stream().map(student -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            row.put("classSection", classSectionLabel(student));
            row.put("fatherName", student.getFatherName());
            row.put("category", student.getCategory() != null ? student.getCategory().getCategoryName() : "");
            row.put("gender", student.getGender());
            row.put("assigned", assignedIds.contains(student.getId()));
            return row;
        }).toList();
    }

    @Transactional
    public void saveAssignedStudents(Long examId, List<Long> studentIds) {
        CbseExam exam = requireExam(examId);
        exam.getStudents().clear();
        if (studentIds != null) {
            for (Long studentId : studentIds) {
                exam.getStudents().add(CbseExamStudent.builder()
                        .cbseExam(exam)
                        .studentAdmissionId(studentId)
                        .assigned(true)
                        .build());
            }
        }
        cbseExamRepository.save(exam);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExamSubjects(Long examId) {
        CbseExam exam = requireExam(examId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getExamName());
        response.put("classSections", formatClassSections(exam));
        response.put("subjects", cbseExamSubjectRepository.findByCbseExamIdOrderByIdAsc(examId).stream()
                .map(this::toSubjectResponse)
                .toList());
        return response;
    }

    @Transactional
    public Map<String, Object> saveExamSubjects(Long examId, List<Map<String, Object>> rows) {
        CbseExam exam = requireExam(examId);
        exam.getSubjects().clear();
        if (rows != null) {
            for (Map<String, Object> row : rows) {
                exam.getSubjects().add(mapSubject(exam, row));
            }
        }
        cbseExamRepository.save(exam);
        return getExamSubjects(examId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExamMarksView(Long examId) {
        return getExamSubjects(examId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamReportOptions() {
        return cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(exam -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", exam.getId());
                    map.put("examName", exam.getExamName());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSubjectMarksReport(Long examId) {
        CbseExam exam = requireExam(examId);
        List<CbseExamSubject> subjects = cbseExamSubjectRepository.findByCbseExamIdOrderByIdAsc(examId);
        if (subjects.isEmpty()) {
            subjects = buildDefaultReportSubjects(exam);
        }

        List<Map<String, Object>> subjectColumns = subjects.stream()
                .map(this::toReportSubjectColumn)
                .toList();

        List<Map<String, Object>> rows = buildSubjectMarksRows(examId, subjects.size(), subjectColumns.size());
        int maxMarksPerSubject = subjectColumns.stream()
                .mapToInt(col -> ((List<?>) col.get("assessments")).size())
                .sum();
        int totalMax = maxMarksPerSubject * subjects.size();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examId", exam.getId());
        response.put("examName", exam.getExamName());
        response.put("subjects", subjectColumns);
        response.put("rows", rows);
        response.put("totalMaxMarks", totalMax > 0 ? totalMax : 525);
        return response;
    }

    private List<CbseExamSubject> buildDefaultReportSubjects(CbseExam exam) {
        List<CbseExamSubject> defaults = new ArrayList<>();
        for (int i = 0; i < 3 && i < SUBJECTS.size(); i++) {
            defaults.add(CbseExamSubject.builder()
                    .cbseExam(exam)
                    .subjectName(SUBJECTS.get(i))
                    .assessments("Theory (TH02), Practical (PC03)")
                    .build());
        }
        return defaults;
    }

    private Map<String, Object> toReportSubjectColumn(CbseExamSubject subject) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("subjectName", subject.getSubjectName());
        map.put("assessments", parseSubjectAssessments(subject.getAssessments()));
        return map;
    }

    private List<Map<String, Object>> parseSubjectAssessments(String assessments) {
        String source = assessments == null || assessments.isBlank()
                ? "Theory (TH02), Practical (PC03)"
                : assessments;
        List<Map<String, Object>> parsed = new ArrayList<>();
        for (String part : source.split(",")) {
            String label = part.trim();
            if (label.isEmpty()) continue;
            Map<String, Object> assessment = new LinkedHashMap<>();
            assessment.put("label", label);
            assessment.put("maxMarks", label.toLowerCase().contains("practical") ? 75 : 100);
            parsed.add(assessment);
        }
        if (parsed.isEmpty()) {
            parsed.add(Map.of("label", "Theory (TH02)", "maxMarks", 100));
            parsed.add(Map.of("label", "Practical (PC03)", "maxMarks", 75));
        }
        return parsed;
    }

    private List<Map<String, Object>> buildSubjectMarksRows(Long examId, int subjectCount, int assessmentsPerSubject) {
        List<CbseExamRank> ranks = cbseExamRankRepository.findByCbseExamIdOrderByStudentRankAsc(examId);
        List<Map<String, Object>> demoRows = demoSubjectMarksRows(subjectCount, assessmentsPerSubject);

        if (!ranks.isEmpty()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            for (int i = 0; i < ranks.size(); i++) {
                CbseExamRank rank = ranks.get(i);
                StudentAdmission student = studentAdmissionRepository.findById(rank.getStudentAdmissionId()).orElse(null);
                Map<String, Object> demo = demoRows.get(Math.min(i, demoRows.size() - 1));
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("studentName", student != null ? fullName(student) : text(demo.get("studentName")));
                row.put("admissionNo", student != null ? student.getAdmissionNo() : text(demo.get("admissionNo")));
                row.put("fatherName", student != null ? text(student.getFatherName()) : text(demo.get("fatherName")));
                row.put("marks", demo.get("marks"));
                row.put("totalMarks", demo.get("totalMarks"));
                row.put("percentage", demo.get("percentage"));
                row.put("grade", demo.get("grade"));
                row.put("rank", rank.getStudentRank());
                rows.add(row);
            }
            return rows;
        }

        List<CbseExamStudent> assigned = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(examId);
        if (!assigned.isEmpty()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            for (int i = 0; i < assigned.size(); i++) {
                StudentAdmission student = studentAdmissionRepository.findById(assigned.get(i).getStudentAdmissionId()).orElse(null);
                Map<String, Object> demo = demoRows.get(Math.min(i, demoRows.size() - 1));
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("studentName", student != null ? fullName(student) : text(demo.get("studentName")));
                row.put("admissionNo", student != null ? student.getAdmissionNo() : text(demo.get("admissionNo")));
                row.put("fatherName", student != null ? text(student.getFatherName()) : text(demo.get("fatherName")));
                row.put("marks", demo.get("marks"));
                row.put("totalMarks", demo.get("totalMarks"));
                row.put("percentage", demo.get("percentage"));
                row.put("grade", demo.get("grade"));
                row.put("rank", i + 1);
                rows.add(row);
            }
            return rows;
        }

        return demoRows;
    }

    private List<Map<String, Object>> demoSubjectMarksRows(int subjectCount, int assessmentsPerSubject) {
        List<List<String>> markSets = List.of(
                List.of("78.00", "56.00", "76.00", "67.00", "87.00", "46.00"),
                List.of("87.00", "35.00", "87.00", "45.00", "88.00", "35.00"),
                List.of("56.00", "46.00", "56.00", "72.00", "35.00", "ABS")
        );
        List<Map<String, Object>> demos = List.of(
                Map.of("studentName", "Sneha Patel", "admissionNo", "002", "fatherName", "Ramesh Patel",
                        "totalMarks", "408/525", "percentage", "77.71", "grade", "B+"),
                Map.of("studentName", "Edward Thomas", "admissionNo", "1800011", "fatherName", "Olivier Thomas",
                        "totalMarks", "377/525", "percentage", "71.81", "grade", "B+"),
                Map.of("studentName", "Hariom Yadav", "admissionNo", "003", "fatherName", "",
                        "totalMarks", "265/525", "percentage", "50.48", "grade", "C")
        );

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < demos.size(); i++) {
            Map<String, Object> demo = new LinkedHashMap<>(demos.get(i));
            List<String> sourceMarks = markSets.get(i);
            List<String> marks = new ArrayList<>();
            int needed = subjectCount * Math.max(assessmentsPerSubject, 2);
            for (int m = 0; m < needed; m++) {
                marks.add(m < sourceMarks.size() ? sourceMarks.get(m) : "0.00");
            }
            demo.put("marks", marks);
            demo.put("rank", i + 1);
            rows.add(demo);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTemplateReportOptions() {
        return List.of(
                Map.of("id", "cbse-2026", "name", "CBSE Report Card Template - 2026"),
                Map.of("id", "cbse-2025", "name", "CBSE Report Card Template - 2025")
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTemplateMarksReport(Long classId, String section, String templateId) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        if (templateId == null || templateId.isBlank()) {
            throw new IllegalArgumentException("Template is required");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid class"));
        String normalizedSection = section.trim();
        boolean sectionExists = schoolClass.getSections().stream()
                .anyMatch(item -> item.equalsIgnoreCase(normalizedSection));
        if (!sectionExists) {
            throw new IllegalArgumentException("Invalid section for selected class");
        }

        String templateName = getTemplateReportOptions().stream()
                .filter(item -> templateId.equals(String.valueOf(item.get("id"))))
                .map(item -> String.valueOf(item.get("name")))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid template"));

        List<Map<String, Object>> subjects = templateReportSubjects();
        List<Map<String, Object>> rows = buildTemplateMarksRows(classId, normalizedSection, schoolClass.getName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("classId", classId);
        response.put("className", schoolClass.getName());
        response.put("section", normalizedSection);
        response.put("templateId", templateId);
        response.put("templateName", templateName);
        response.put("subjects", subjects);
        response.put("rows", rows);
        response.put("totalMaxMarks", 525);
        return response;
    }

    private List<Map<String, Object>> templateReportSubjects() {
        List<String> names = List.of("Mathematics (110)", "Science (111)", "Social Studies (212)");
        List<Map<String, Object>> subjects = new ArrayList<>();
        for (String name : names) {
            Map<String, Object> subject = new LinkedHashMap<>();
            subject.put("subjectName", name);
            subject.put("assessments", parseSubjectAssessments("Theory (TH02), Practical (PC03)"));
            subjects.add(subject);
        }
        return subjects;
    }

    private List<Map<String, Object>> buildTemplateMarksRows(Long classId, String section, String className) {
        List<StudentAdmission> students = studentAdmissionRepository.search(classId, section, null, false, null);
        List<Map<String, Object>> demoRows = demoTemplateMarksRows(className + " (" + section + ")");

        if (students.isEmpty()) {
            return demoRows;
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < students.size(); i++) {
            StudentAdmission student = students.get(i);
            Map<String, Object> demo = demoRows.get(i % demoRows.size());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            row.put("className", className + " (" + section + ")");
            row.put("marks", demo.get("marks"));
            row.put("totalMarks", demo.get("totalMarks"));
            row.put("percentage", demo.get("percentage"));
            row.put("grade", demo.get("grade"));
            row.put("rank", i + 1);
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> demoTemplateMarksRows(String classLabel) {
        List<List<String>> markSets = List.of(
                List.of("92.00", "68.00", "88.00", "62.00", "85.00", "58.00"),
                List.of("84.00", "60.00", "79.00", "55.00", "82.00", "52.00"),
                List.of("87.00", "34.00", "81.00", "48.00", "76.00", "59.00"),
                List.of("72.00", "45.00", "68.00", "42.00", "70.00", "38.00"),
                List.of("65.00", "40.00", "62.00", "36.00", "58.00", "35.00")
        );
        List<Map<String, Object>> demos = List.of(
                demoTemplateRow("Sneha Patel", "002", classLabel, "420/525", "80.00", "A", 1),
                demoTemplateRow("Hariom Yadav", "003", classLabel, "390/525", "74.29", "B+", 2),
                demoTemplateRow("Edward Thomas", "1800011", classLabel, "385/525", "73.33", "B+", 3),
                demoTemplateRow("Priya Sharma", "004", classLabel, "352/525", "67.05", "B", 4),
                demoTemplateRow("Rahul Singh", "005", classLabel, "310/525", "59.05", "C", 5)
        );

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < demos.size(); i++) {
            Map<String, Object> demo = new LinkedHashMap<>(demos.get(i));
            demo.put("marks", markSets.get(i));
            rows.add(demo);
        }
        return rows;
    }

    private Map<String, Object> demoTemplateRow(String studentName, String admissionNo, String className,
                                                String totalMarks, String percentage, String grade, int rank) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("studentName", studentName);
        row.put("admissionNo", admissionNo);
        row.put("className", className);
        row.put("totalMarks", totalMarks);
        row.put("percentage", percentage);
        row.put("grade", grade);
        row.put("rank", rank);
        return row;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchExamAttendance(Long examId, String fromDate, String toDate) {
        requireExam(examId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("records", List.of());
        response.put("message", "No Record Found");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherRemarks(Long examId) {
        requireExam(examId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("records", List.of());
        response.put("message", "No Record Found");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGenerateRankData(Long examId) {
        CbseExam exam = requireExam(examId);
        List<CbseExamRank> existingRanks = cbseExamRankRepository.findByCbseExamIdOrderByStudentRankAsc(examId);

        List<Map<String, Object>> rows;
        if (!existingRanks.isEmpty()) {
            rows = existingRanks.stream().map(this::toRankRow).toList();
        } else {
            rows = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(examId).stream()
                    .map(assignment -> toStudentRankPreviewRow(assignment.getStudentAdmissionId()))
                    .toList();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getExamName());
        response.put("rankGenerated", exam.isRankGenerated());
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> generateRank(Long examId) {
        CbseExam exam = requireExam(examId);
        List<CbseExamStudent> assigned = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(examId);
        if (assigned.isEmpty()) {
            throw new IllegalArgumentException("Assign students before generating rank");
        }

        cbseExamRankRepository.deleteByCbseExamId(examId);

        int rankValue = 1;
        List<CbseExamRank> ranks = new ArrayList<>();
        for (CbseExamStudent assignment : assigned) {
            ranks.add(CbseExamRank.builder()
                    .cbseExam(exam)
                    .studentAdmissionId(assignment.getStudentAdmissionId())
                    .studentRank(rankValue++)
                    .build());
        }
        cbseExamRankRepository.saveAll(ranks);
        exam.setRankGenerated(true);
        cbseExamRepository.save(exam);
        return getGenerateRankData(examId);
    }

    private CbseExam requireExam(Long id) {
        return cbseExamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + id));
    }

    private CbseExam mapExam(CbseExam exam, Map<String, Object> body) {
        exam.setExamName(text(body.get("examName")));
        exam.setDescription(text(body.get("description")));
        exam.setPublished(asBoolean(body.get("published")));
        exam.setPublishResult(asBoolean(body.get("publishResult")));
        exam.setTerm(text(body.get("term")));
        applyClassAndSection(exam, body);
        exam.setAssessment(text(body.get("assessment")));
        exam.setGrade(text(body.get("grade")));
        exam.setCategoryName(text(body.get("categoryName")));
        if (body.containsKey("admitCardRollType")) {
            exam.setAdmitCardRollType(text(body.get("admitCardRollType")));
        }
        if (body.containsKey("mailTemplate")) {
            exam.setMailTemplate(text(body.get("mailTemplate")));
        }
        return exam;
    }

    private CbseExamSubject mapSubject(CbseExam exam, Map<String, Object> row) {
        return CbseExamSubject.builder()
                .cbseExam(exam)
                .subjectName(text(row.get("subjectName")))
                .assessments(text(row.get("assessments")))
                .examDate(parseDate(row.get("examDate")))
                .startTime(parseTime(row.get("startTime")))
                .durationMinutes(parseInteger(row.get("durationMinutes")))
                .roomNo(text(row.get("roomNo")))
                .build();
    }

    private void validateExam(CbseExam exam) {
        if (exam.getExamName().isBlank()) throw new IllegalArgumentException("Exam name is required");
        if (exam.getTerm().isBlank()) throw new IllegalArgumentException("Term is required");
        if (exam.getClassName().isBlank()) throw new IllegalArgumentException("Class is required");
        if (exam.getSections().isBlank()) throw new IllegalArgumentException("Section is required");
        if (exam.getAssessment().isBlank()) throw new IllegalArgumentException("Assessment is required");
        if (exam.getGrade().isBlank()) throw new IllegalArgumentException("Grade is required");
        if (exam.getCategoryName().isBlank()) throw new IllegalArgumentException("Category is required");
    }

    private Map<String, Object> toListResponse(CbseExam exam) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", exam.getId());
        map.put("examName", exam.getExamName());
        map.put("classSections", formatClassSections(exam));
        map.put("term", exam.getTerm());
        map.put("subjectsIncluded", cbseExamSubjectRepository.countByCbseExamId(exam.getId()));
        map.put("published", exam.isPublished());
        map.put("publishResult", exam.isPublishResult());
        map.put("categoryName", exam.getCategoryName());
        map.put("description", exam.getDescription());
        map.put("createdAt", exam.getCreatedAt() != null ? exam.getCreatedAt().format(DATE_FMT) : "");
        map.put("className", exam.getClassName());
        map.put("classId", resolveClassId(exam.getClassName()));
        map.put("sections", exam.getSections());
        map.put("assessment", exam.getAssessment());
        map.put("grade", exam.getGrade());
        map.put("admitCardRollType", exam.getAdmitCardRollType());
        map.put("mailTemplate", exam.getMailTemplate());
        map.put("rankGenerated", exam.isRankGenerated());
        return map;
    }

    private Map<String, Object> toSubjectResponse(CbseExamSubject subject) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", subject.getId());
        map.put("subjectName", subject.getSubjectName());
        map.put("assessments", subject.getAssessments());
        map.put("examDate", subject.getExamDate() != null ? subject.getExamDate().format(DATE_FMT) : "");
        map.put("startTime", subject.getStartTime() != null ? subject.getStartTime().format(TIME_FMT) : "");
        map.put("durationMinutes", subject.getDurationMinutes());
        map.put("roomNo", subject.getRoomNo());
        return map;
    }

    private Map<String, Object> toRankRow(CbseExamRank rank) {
        StudentAdmission student = studentAdmissionRepository.findById(rank.getStudentAdmissionId()).orElse(null);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", rank.getStudentAdmissionId());
        map.put("rank", rank.getStudentRank());
        if (student != null) {
            map.put("admissionNo", student.getAdmissionNo());
            map.put("studentName", fullName(student));
            map.put("className", classSectionLabel(student));
            map.put("fatherName", student.getFatherName());
            map.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().format(DATE_FMT) : "");
            map.put("gender", student.getGender());
            map.put("mobileNo", student.getMobileNumber());
        }
        return map;
    }

    private Map<String, Object> toStudentRankPreviewRow(Long studentAdmissionId) {
        StudentAdmission student = studentAdmissionRepository.findById(studentAdmissionId).orElse(null);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", studentAdmissionId);
        map.put("rank", "");
        if (student != null) {
            map.put("admissionNo", student.getAdmissionNo());
            map.put("studentName", fullName(student));
            map.put("className", classSectionLabel(student));
            map.put("fatherName", student.getFatherName());
            map.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().format(DATE_FMT) : "");
            map.put("gender", student.getGender());
            map.put("mobileNo", student.getMobileNumber());
        }
        return map;
    }

    private String formatClassSections(CbseExam exam) {
        return exam.getClassName() + " (" + exam.getSections().replace(",", ", ") + ")";
    }

    private String fullName(StudentAdmission student) {
        return (student.getFirstName() + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
    }

    private String classSectionLabel(StudentAdmission student) {
        String cls = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
        return cls + "(" + student.getSection() + ")";
    }

    private Long resolveClassId(String className) {
        if (className == null || className.isBlank()) {
            return null;
        }
        return schoolClassRepository.findByNameIgnoreCase(className.trim())
                .map(SchoolClass::getId)
                .orElse(null);
    }

    private List<Map<String, Object>> loadClassesFromDb() {
        return schoolClassRepository.findAllByOrderByIdAsc().stream()
                .map(schoolClass -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", schoolClass.getId());
                    row.put("name", schoolClass.getName());
                    row.put("sections", schoolClass.getSections() == null ? List.of() : schoolClass.getSections());
                    return row;
                })
                .toList();
    }

    private void applyClassAndSection(CbseExam exam, Map<String, Object> body) {
        SchoolClass schoolClass = resolveSchoolClass(body);
        String section = text(body.get("sections"));
        if (section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        boolean validSection = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(item -> item.equalsIgnoreCase(section));
        if (!validSection) {
            throw new IllegalArgumentException("Invalid section for selected class");
        }

        exam.setClassName(schoolClass.getName());
        exam.setSections(section);
    }

    private SchoolClass resolveSchoolClass(Map<String, Object> body) {
        Object classIdValue = body.get("classId");
        if (classIdValue != null && !String.valueOf(classIdValue).isBlank()) {
            Long classId = Long.parseLong(String.valueOf(classIdValue).trim());
            return schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid class"));
        }

        String className = text(body.get("className"));
        if (className.isBlank()) {
            throw new IllegalArgumentException("Class is required");
        }
        return schoolClassRepository.findByNameIgnoreCase(className)
                .orElseThrow(() -> new IllegalArgumentException("Invalid class"));
    }

    private void seedExams() {
        List<SchoolClass> classes = schoolClassRepository.findAllByOrderByIdAsc();
        if (classes.isEmpty()) {
            return;
        }

        SchoolClass classOne = classes.get(0);
        String classOneName = classOne.getName();
        String classOneSections = joinSections(classOne.getSections(), 4);

        createSeedExam("CBSE All Term Examination (August 2026)", "Term 1 (T021)",
                classOneName, classOneSections, "Periodic Assessment", "Exam Grade",
                "Main Subjects", true, true, 3);
        createSeedExam("CBSE All Term Examination (August 2026)", "Term 1 (T021)",
                classOneName, classOneSections, "Periodic Assessment", "Exam Grade",
                "Internal Assessment", true, true, 2);

        if (classes.size() > 1) {
            SchoolClass classTwo = classes.get(1);
            createSeedExam("CBSE Half Yearly Examination (August 2026)", "Term 2 (T015)",
                    classTwo.getName(), joinSections(classTwo.getSections(), 2), "Half Yearly", "Exam Grade",
                    "Main Subjects", true, false, 3);
        }
    }

    private String joinSections(List<String> sections, int maxCount) {
        if (sections == null || sections.isEmpty()) {
            return "A";
        }
        return sections.stream()
                .limit(maxCount)
                .collect(Collectors.joining(","));
    }

    private void createSeedExam(String name, String term, String className, String sections,
                                String assessment, String grade, String category,
                                boolean published, boolean publishResult, int subjectCount) {
        CbseExam exam = CbseExam.builder()
                .examName(name)
                .description(name)
                .published(published)
                .publishResult(publishResult)
                .term(term)
                .className(className)
                .sections(sections)
                .assessment(assessment)
                .grade(grade)
                .categoryName(category)
                .build();

        for (int i = 0; i < subjectCount && i < SUBJECTS.size(); i++) {
            exam.getSubjects().add(CbseExamSubject.builder()
                    .cbseExam(exam)
                    .subjectName(SUBJECTS.get(i))
                    .assessments("Theory (TH02), Practical (PC03)")
                    .examDate(LocalDate.of(2026, 8, 6))
                    .startTime(LocalTime.of(16, 27, 11))
                    .durationMinutes(60)
                    .roomNo("101")
                    .build());
        }
        cbseExamRepository.save(exam);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean bool) return bool;
        if (value == null) return false;
        String text = String.valueOf(value).trim();
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "on".equalsIgnoreCase(text) || "yes".equalsIgnoreCase(text);
    }

    private Integer parseInteger(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        return Integer.parseInt(String.valueOf(value).trim());
    }

    private LocalDate parseDate(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        String text = String.valueOf(value).trim();
        if (text.contains("-")) return LocalDate.parse(text);
        return LocalDate.parse(text, DATE_FMT);
    }

    private LocalTime parseTime(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        String text = String.valueOf(value).trim();
        if (text.length() == 5) return LocalTime.parse(text + ":00");
        return LocalTime.parse(text);
    }
}
