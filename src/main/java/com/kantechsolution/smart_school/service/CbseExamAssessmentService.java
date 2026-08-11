package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CbseExamAssessment;
import com.kantechsolution.smart_school.model.CbseExamAssessmentDetail;
import com.kantechsolution.smart_school.repository.CbseExamAssessmentRepository;
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
public class CbseExamAssessmentService implements ApplicationRunner {

    private final CbseExamAssessmentRepository cbseExamAssessmentRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (cbseExamAssessmentRepository.count() > 0) {
            return;
        }
        seedAssessments();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssessments() {
        return cbseExamAssessmentRepository.findAllByOrderByAssessmentNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAssessmentById(Long id) {
        return toResponse(requireAssessment(id));
    }

    @Transactional(readOnly = true)
    public List<String> getAssessmentNames() {
        return cbseExamAssessmentRepository.findAllByOrderByAssessmentNameAsc().stream()
                .map(CbseExamAssessment::getAssessmentName)
                .toList();
    }

    @Transactional
    public Map<String, Object> createAssessment(Map<String, Object> body) {
        CbseExamAssessment assessment = mapAssessment(new CbseExamAssessment(), body);
        validateAssessment(assessment, null);
        return toResponse(cbseExamAssessmentRepository.save(assessment));
    }

    @Transactional
    public Map<String, Object> updateAssessment(Long id, Map<String, Object> body) {
        CbseExamAssessment assessment = requireAssessment(id);
        mapAssessment(assessment, body);
        validateAssessment(assessment, id);
        return toResponse(cbseExamAssessmentRepository.save(assessment));
    }

    @Transactional
    public void deleteAssessment(Long id) {
        if (!cbseExamAssessmentRepository.existsById(id)) {
            throw new RuntimeException("Assessment not found with ID: " + id);
        }
        cbseExamAssessmentRepository.deleteById(id);
    }

    private CbseExamAssessment requireAssessment(Long id) {
        return cbseExamAssessmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + id));
    }

    private CbseExamAssessment mapAssessment(CbseExamAssessment assessment, Map<String, Object> body) {
        assessment.setAssessmentName(text(body.get("assessmentName")));
        assessment.setAssessmentDescription(text(body.get("assessmentDescription")));

        assessment.getDetails().clear();
        int sortOrder = 0;
        for (Map<String, Object> row : castDetailRows(body.get("details"))) {
            assessment.getDetails().add(CbseExamAssessmentDetail.builder()
                    .cbseExamAssessment(assessment)
                    .assessmentType(text(row.get("assessmentType")))
                    .code(text(row.get("code")))
                    .maximumMarks(parseInteger(row.get("maximumMarks")))
                    .passPercentage(parseInteger(row.get("passPercentage")))
                    .description(text(row.get("description")))
                    .sortOrder(sortOrder++)
                    .build());
        }
        return assessment;
    }

    private void validateAssessment(CbseExamAssessment assessment, Long excludeId) {
        if (assessment.getAssessmentName().isBlank()) {
            throw new IllegalArgumentException("Assessment is required");
        }
        if (excludeId == null) {
            if (cbseExamAssessmentRepository.existsByAssessmentNameIgnoreCase(assessment.getAssessmentName())) {
                throw new IllegalArgumentException("Assessment already exists");
            }
        } else if (cbseExamAssessmentRepository.existsByAssessmentNameIgnoreCaseAndIdNot(
                assessment.getAssessmentName(), excludeId)) {
            throw new IllegalArgumentException("Assessment already exists");
        }
        if (assessment.getDetails().isEmpty()) {
            throw new IllegalArgumentException("At least one assessment row is required");
        }
        for (CbseExamAssessmentDetail detail : assessment.getDetails()) {
            if (detail.getAssessmentType().isBlank()) {
                throw new IllegalArgumentException("Assessment type is required for each row");
            }
            if (detail.getMaximumMarks() == null || detail.getPassPercentage() == null) {
                throw new IllegalArgumentException("Maximum marks and pass percentage are required");
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castDetailRows(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                rows.add((Map<String, Object>) map);
            }
        }
        return rows;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Integer parseInteger(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        return Integer.parseInt(String.valueOf(value).trim());
    }

    private Map<String, Object> toResponse(CbseExamAssessment assessment) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", assessment.getId());
        map.put("assessmentName", assessment.getAssessmentName());
        map.put("assessmentDescription", assessment.getAssessmentDescription() != null
                ? assessment.getAssessmentDescription() : "");
        map.put("details", assessment.getDetails().stream().map(this::toDetailResponse).toList());
        return map;
    }

    private Map<String, Object> toDetailResponse(CbseExamAssessmentDetail detail) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", detail.getId());
        map.put("assessmentType", detail.getAssessmentType());
        map.put("code", detail.getCode() != null ? detail.getCode() : "");
        map.put("maximumMarks", detail.getMaximumMarks());
        map.put("passPercentage", detail.getPassPercentage());
        map.put("description", detail.getDescription() != null ? detail.getDescription() : "");
        map.put("sortOrder", detail.getSortOrder());
        return map;
    }

    private void seedAssessments() {
        cbseExamAssessmentRepository.save(buildAssessment(
                "Periodic Assessment",
                "Periodic assessment for CBSE exams",
                new String[][]{
                        {"Theory (TH02)", "TH02", "80", "33", "Written examination"},
                        {"Practical (PC03)", "PC03", "20", "33", "Practical examination"}
                }
        ));
        cbseExamAssessmentRepository.save(buildAssessment(
                "Half Yearly",
                "Half yearly examination",
                new String[][]{
                        {"Theory (TH02)", "TH02", "80", "33", "Written examination"},
                        {"Assignment (AS01)", "AS01", "20", "33", "Assignment work"}
                }
        ));
    }

    private CbseExamAssessment buildAssessment(String name, String description, String[][] rows) {
        CbseExamAssessment assessment = CbseExamAssessment.builder()
                .assessmentName(name)
                .assessmentDescription(description)
                .build();
        int sortOrder = 0;
        for (String[] row : rows) {
            assessment.getDetails().add(CbseExamAssessmentDetail.builder()
                    .cbseExamAssessment(assessment)
                    .assessmentType(row[0])
                    .code(row[1])
                    .maximumMarks(Integer.parseInt(row[2]))
                    .passPercentage(Integer.parseInt(row[3]))
                    .description(row[4])
                    .sortOrder(sortOrder++)
                    .build());
        }
        return assessment;
    }
}
