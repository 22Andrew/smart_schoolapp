package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ExamGroup;
import com.kantechsolution.smart_school.model.ExamGroupExam;
import com.kantechsolution.smart_school.model.ExamGroupExamStudent;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.ExamGroupExamRepository;
import com.kantechsolution.smart_school.repository.ExamGroupExamStudentRepository;
import com.kantechsolution.smart_school.repository.ExamGroupRepository;
import com.kantechsolution.smart_school.repository.ExamScheduleEntryRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamGroupService implements ApplicationRunner {

    public static final List<String> EXAM_TYPES = List.of(
            "General Purpose (Pass/Fail)",
            "School Based Grading System",
            "College Based Grading System",
            "GPA Grading System",
            "Average Passing"
    );

    private final ExamGroupRepository examGroupRepository;
    private final ExamGroupExamRepository examGroupExamRepository;
    private final ExamScheduleEntryRepository examScheduleEntryRepository;
    private final ExamGroupExamStudentRepository examGroupExamStudentRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (examGroupRepository.count() > 0) {
            return;
        }
        seedExamGroups();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllExamGroups() {
        return examGroupRepository.findAllByOrderByNameAsc().stream()
                .filter(group -> group.getIsActive() == null || Boolean.TRUE.equals(group.getIsActive()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamGroupOptions() {
        return getAllExamGroups();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamsByGroupId(Long groupId) {
        if (groupId == null) {
            throw new IllegalArgumentException("Exam group is required");
        }
        if (!examGroupRepository.existsById(groupId)) {
            throw new IllegalArgumentException("Exam group not found");
        }
        return examGroupExamRepository.findByExamGroupIdOrderByIdAsc(groupId).stream()
                .filter(exam -> exam.getIsActive() == null || Boolean.TRUE.equals(exam.getIsActive()))
                .map(exam -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", exam.getId());
                    map.put("name", exam.getName());
                    long subjectCount = examScheduleEntryRepository.countByExamGroupExamId(exam.getId());
                    map.put("subjectsIncluded", subjectCount > 0 ? subjectCount : 0);
                    map.put("session", exam.getSessionYear() != null ? exam.getSessionYear() : "2026-27");
                    map.put("publishExam", exam.getPublishExam() == null || Boolean.TRUE.equals(exam.getPublishExam()));
                    map.put("publishResult", exam.getPublishResult() == null || Boolean.TRUE.equals(exam.getPublishResult()));
                    map.put("description", exam.getDescription() != null ? exam.getDescription() : exam.getName());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getExamTypes() {
        return EXAM_TYPES;
    }

    @Transactional
    public Map<String, Object> saveExamGroup(ExamGroup examGroup) {
        validateExamGroup(examGroup, null);
        ExamGroup saved = examGroupRepository.save(examGroup);
        return toResponse(saved);
    }

    @Transactional
    public Map<String, Object> updateExamGroup(Long id, ExamGroup details) {
        ExamGroup examGroup = examGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam group not found with ID: " + id));
        validateExamGroup(details, id);
        examGroup.setName(details.getName());
        examGroup.setExamType(details.getExamType());
        examGroup.setDescription(details.getDescription());
        return toResponse(examGroupRepository.save(examGroup));
    }

    @Transactional
    public void deleteExamGroup(Long id) {
        if (!examGroupRepository.existsById(id)) {
            throw new RuntimeException("Exam group not found with ID: " + id);
        }
        examGroupRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> addExamToGroup(Long groupId, String examName) {
        ExamGroup examGroup = examGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Exam group not found with ID: " + groupId));
        if (examName == null || examName.isBlank()) {
            throw new IllegalArgumentException("Exam name is required");
        }

        ExamGroupExam exam = ExamGroupExam.builder()
                .name(examName.trim())
                .examGroup(examGroup)
                .sessionYear("2026-27")
                .publishExam(true)
                .publishResult(true)
                .rollType("ADMIT_CARD")
                .description(examName.trim())
                .rankGenerated(false)
                .build();
        examGroupExamRepository.save(exam);
        return toResponse(examGroupRepository.findById(groupId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamStudents(Long groupId, Long examId, Long classId, String section) {
        ExamGroupExam exam = examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        Set<Long> assignedIds = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(ExamGroupExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        return students.stream().map(student -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            row.put("fatherName", student.getFatherName());
            row.put("category", student.getCategory() != null ? student.getCategory().getCategoryName() : "");
            row.put("gender", student.getGender());
            row.put("assigned", assignedIds.contains(student.getId()));
            return row;
        }).toList();
    }

    @Transactional
    public void saveExamStudents(Long groupId, Long examId, List<Long> studentIds) {
        ExamGroupExam exam = examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        examGroupExamStudentRepository.deleteByExamGroupExamId(exam.getId());
        if (studentIds != null) {
            for (Long studentId : studentIds) {
                examGroupExamStudentRepository.save(ExamGroupExamStudent.builder()
                        .examGroupExam(exam)
                        .studentAdmissionId(studentId)
                        .assigned(true)
                        .build());
            }
        }
    }

    private String fullName(StudentAdmission student) {
        return (student.getFirstName() + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
    }

    private void validateExamGroup(ExamGroup examGroup, Long excludeId) {
        if (examGroup.getName() == null || examGroup.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (examGroup.getExamType() == null || examGroup.getExamType().isBlank()) {
            throw new IllegalArgumentException("Exam type is required");
        }
        if (!EXAM_TYPES.contains(examGroup.getExamType())) {
            throw new IllegalArgumentException("Invalid exam type");
        }

        String name = examGroup.getName().trim();
        examGroup.setName(name);
        examGroup.setExamType(examGroup.getExamType().trim());
        examGroup.setDescription(examGroup.getDescription() == null ? null : examGroup.getDescription().trim());

        boolean duplicate = examGroupRepository.findByNameIgnoreCase(name)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .isPresent();
        if (duplicate) {
            throw new IllegalArgumentException("Exam group already exists");
        }
    }

    private Map<String, Object> toResponse(ExamGroup examGroup) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", examGroup.getId());
        map.put("name", examGroup.getName());
        map.put("examType", examGroup.getExamType());
        map.put("description", examGroup.getDescription());
        map.put("examCount", examGroupExamRepository.countByExamGroupId(examGroup.getId()));
        return map;
    }

    private void seedExamGroups() {
        List<SeedGroup> seeds = List.of(
                new SeedGroup("General Exam (Pass / Fail)", "General Purpose (Pass/Fail)", 7),
                new SeedGroup("Grading System (School Based Grading System)", "School Based Grading System", 4),
                new SeedGroup("CGPA (College Based Grading System)", "College Based Grading System", 5),
                new SeedGroup("GPA Exam Grading System", "GPA Grading System", 6),
                new SeedGroup("Average Passing Exam", "Average Passing", 7)
        );

        for (SeedGroup seed : seeds) {
            ExamGroup group = ExamGroup.builder()
                    .name(seed.name())
                    .examType(seed.examType())
                    .description("")
                    .exams(new ArrayList<>())
                    .build();

            for (int i = 1; i <= seed.examCount(); i++) {
                String examName;
                if ("General Exam (Pass / Fail)".equals(seed.name()) && i == 1) {
                    examName = "CBSE Monthly Test-May";
                } else if ("CGPA (College Based Grading System)".equals(seed.name()) && i == 1) {
                    examName = "College Grade Test (May-2026)";
                } else {
                    examName = "Exam " + i;
                }
                group.getExams().add(ExamGroupExam.builder()
                        .name(examName)
                        .examGroup(group)
                        .sessionYear("2026-27")
                        .publishExam(true)
                        .publishResult(true)
                        .rollType("ADMIT_CARD")
                        .description(examName)
                        .rankGenerated(false)
                        .build());
            }
            examGroupRepository.save(group);
        }
    }

    private record SeedGroup(String name, String examType, int examCount) {
    }
}
