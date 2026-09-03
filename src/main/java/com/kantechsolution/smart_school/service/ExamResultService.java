package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamResultService implements ApplicationRunner {

    private static final List<String> SESSION_OPTIONS = List.of(
            "2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27"
    );

    private static final List<SubjectSeed> DEFAULT_SUBJECTS = List.of(
            new SubjectSeed("English", "210", new BigDecimal("100.00")),
            new SubjectSeed("Mathematics", "110", new BigDecimal("100.00")),
            new SubjectSeed("Science", "111", new BigDecimal("100.00"))
    );

    private final ExamGroupRepository examGroupRepository;
    private final ExamGroupExamRepository examGroupExamRepository;
    private final ExamResultRecordRepository examResultRecordRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (examResultRecordRepository.count() > 0) {
            return;
        }
        seedSampleResults();
    }

    @Transactional(readOnly = true)
    public List<String> getSessionOptions() {
        return SESSION_OPTIONS;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchResults(Long groupId, Long examId, String sessionYear,
                                           Long classId, String section) {
        if (groupId == null) {
            throw new IllegalArgumentException("Exam group is required");
        }
        if (examId == null) {
            throw new IllegalArgumentException("Exam is required");
        }
        if (sessionYear == null || sessionYear.isBlank()) {
            throw new IllegalArgumentException("Session is required");
        }
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        ExamGroupExam exam = examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found for selected group"));

        List<ExamResultRecord> records = examResultRecordRepository.searchResults(
                exam.getId(), sessionYear.trim(), classId, section.trim());

        List<Map<String, Object>> subjectColumns = buildSubjectColumns(records);
        List<Map<String, Object>> rows = records.stream()
                .map(record -> toRowResponse(record, subjectColumns))
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjects", subjectColumns);
        response.put("rows", rows);
        return response;
    }

    private List<Map<String, Object>> buildSubjectColumns(List<ExamResultRecord> records) {
        LinkedHashMap<String, Map<String, Object>> columns = new LinkedHashMap<>();

        if (!records.isEmpty()) {
            for (ExamResultSubjectMark mark : records.get(0).getSubjectMarks()) {
                String key = subjectKey(mark.getSubjectName(), mark.getSubjectCode());
                Map<String, Object> column = new LinkedHashMap<>();
                column.put("key", key);
                column.put("name", mark.getSubjectName());
                column.put("code", mark.getSubjectCode());
                column.put("maxMarks", formatMarks(mark.getMarksMax()));
                columns.put(key, column);
            }
        }

        if (columns.isEmpty()) {
            for (SubjectSeed seed : DEFAULT_SUBJECTS) {
                String key = subjectKey(seed.name(), seed.code());
                Map<String, Object> column = new LinkedHashMap<>();
                column.put("key", key);
                column.put("name", seed.name());
                column.put("code", seed.code());
                column.put("maxMarks", formatMarks(seed.maxMarks()));
                columns.put(key, column);
            }
        }

        return new ArrayList<>(columns.values());
    }

    private Map<String, Object> toRowResponse(ExamResultRecord record, List<Map<String, Object>> subjectColumns) {
        StudentAdmission student = record.getStudentAdmission();
        Map<String, String> subjectMarks = new LinkedHashMap<>();

        for (Map<String, Object> column : subjectColumns) {
            String key = String.valueOf(column.get("key"));
            subjectMarks.put(key, "");
        }

        for (ExamResultSubjectMark mark : record.getSubjectMarks()) {
            String key = subjectKey(mark.getSubjectName(), mark.getSubjectCode());
            subjectMarks.put(key, formatMarks(mark.getMarksObtained()) + "/"
                    + formatMarks(mark.getMarksMax()) + " - " + defaultText(mark.getSubjectCode()));
        }

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("admissionNo", student.getAdmissionNo());
        row.put("rollNumber", defaultText(student.getRollNumber()));
        row.put("studentName", fullName(student));
        row.put("subjectMarks", subjectMarks);
        row.put("grandTotal", formatMarks(record.getGrandTotal()));
        row.put("percent", formatMarks(record.getPercent()));
        row.put("rank", record.getStudentRank() == null ? "" : String.valueOf(record.getStudentRank()));
        row.put("result", defaultText(record.getResultStatus()));
        return row;
    }

    private void seedSampleResults() {
        examGroupRepository.findByNameIgnoreCase("CGPA (College Based Grading System)").ifPresent(group -> {
            ExamGroupExam exam = examGroupExamRepository.findByExamGroupIdOrderByIdAsc(group.getId()).stream()
                    .filter(item -> "College Grade Test (May-2026)".equalsIgnoreCase(item.getName()))
                    .findFirst()
                    .orElse(null);
            if (exam == null) {
                return;
            }

            schoolClassRepository.findAllByOrderByIdAsc().stream().findFirst().ifPresent(schoolClass -> {
                List<StudentAdmission> students = studentAdmissionRepository.search(
                        schoolClass.getId(), "A", null, false, null);
                if (students.isEmpty()) {
                    students = studentAdmissionRepository.search(
                            schoolClass.getId(), "B", null, false, null);
                }
                if (students.isEmpty()) {
                    return;
                }

                int rank = 1;
                for (StudentAdmission student : students.stream().limit(5).toList()) {
                    ExamResultRecord record = ExamResultRecord.builder()
                            .examGroupExam(exam)
                            .studentAdmission(student)
                            .sessionYear("2019-20")
                            .grandTotal(new BigDecimal("120.00"))
                            .percent(new BigDecimal("40.00"))
                            .studentRank(rank++)
                            .resultStatus("Fail")
                            .subjectMarks(new ArrayList<>())
                            .build();

                    for (SubjectSeed seed : DEFAULT_SUBJECTS) {
                        record.getSubjectMarks().add(ExamResultSubjectMark.builder()
                                .examResultRecord(record)
                                .subjectName(seed.name())
                                .subjectCode(seed.code())
                                .marksObtained(new BigDecimal("40.00"))
                                .marksMax(seed.maxMarks())
                                .build());
                    }
                    examResultRecordRepository.save(record);
                }
            });
        });
    }

    private String subjectKey(String name, String code) {
        String base = name == null ? "subject" : name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "_");
        if (code != null && !code.isBlank()) {
            return base + "_" + code.replaceAll("[^a-zA-Z0-9]+", "");
        }
        return base;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String formatMarks(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return value.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }

    private String defaultText(String value) {
        return value == null ? "" : value;
    }

    private record SubjectSeed(String name, String code, BigDecimal maxMarks) {
    }
}
