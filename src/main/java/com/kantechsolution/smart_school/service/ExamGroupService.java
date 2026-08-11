package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ExamGroup;
import com.kantechsolution.smart_school.model.ExamGroupExam;
import com.kantechsolution.smart_school.repository.ExamGroupExamRepository;
import com.kantechsolution.smart_school.repository.ExamGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
                .build();
        examGroupExamRepository.save(exam);
        return toResponse(examGroupRepository.findById(groupId).orElseThrow());
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
                        .build());
            }
            examGroupRepository.save(group);
        }
    }

    private record SeedGroup(String name, String examType, int examCount) {
    }
}
