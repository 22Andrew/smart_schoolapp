package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CbseExamGrade;
import com.kantechsolution.smart_school.model.CbseExamGradeDetail;
import com.kantechsolution.smart_school.repository.CbseExamGradeRepository;
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
public class CbseExamGradeService implements ApplicationRunner {

    private final CbseExamGradeRepository cbseExamGradeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (cbseExamGradeRepository.count() > 0) {
            return;
        }
        seedGrades();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllGrades() {
        return cbseExamGradeRepository.findAllByOrderByGradeTitleAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGradeById(Long id) {
        return toResponse(requireGrade(id));
    }

    @Transactional(readOnly = true)
    public List<String> getGradeTitles() {
        return cbseExamGradeRepository.findAllByOrderByGradeTitleAsc().stream()
                .map(CbseExamGrade::getGradeTitle)
                .toList();
    }

    @Transactional
    public Map<String, Object> createGrade(Map<String, Object> body) {
        CbseExamGrade grade = mapGrade(new CbseExamGrade(), body);
        validateGrade(grade, null);
        return toResponse(cbseExamGradeRepository.save(grade));
    }

    @Transactional
    public Map<String, Object> updateGrade(Long id, Map<String, Object> body) {
        CbseExamGrade grade = requireGrade(id);
        mapGrade(grade, body);
        validateGrade(grade, id);
        return toResponse(cbseExamGradeRepository.save(grade));
    }

    @Transactional
    public void deleteGrade(Long id) {
        if (!cbseExamGradeRepository.existsById(id)) {
            throw new RuntimeException("Exam grade not found with ID: " + id);
        }
        cbseExamGradeRepository.deleteById(id);
    }

    private CbseExamGrade requireGrade(Long id) {
        return cbseExamGradeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Exam grade not found with ID: " + id));
    }

    private CbseExamGrade mapGrade(CbseExamGrade grade, Map<String, Object> body) {
        grade.setGradeTitle(text(body.get("gradeTitle")));
        grade.setDescription(text(body.get("description")));

        grade.getDetails().clear();
        List<Map<String, Object>> detailRows = castDetailRows(body.get("details"));
        int sortOrder = 0;
        for (Map<String, Object> row : detailRows) {
            grade.getDetails().add(CbseExamGradeDetail.builder()
                    .cbseExamGrade(grade)
                    .gradeName(text(row.get("gradeName")))
                    .maxPercentage(parseInteger(row.get("maxPercentage")))
                    .minPercentage(parseInteger(row.get("minPercentage")))
                    .remark(text(row.get("remark")))
                    .sortOrder(sortOrder++)
                    .build());
        }
        return grade;
    }

    private void validateGrade(CbseExamGrade grade, Long excludeId) {
        if (grade.getGradeTitle().isBlank()) {
            throw new IllegalArgumentException("Grade title is required");
        }
        if (excludeId == null) {
            if (cbseExamGradeRepository.existsByGradeTitleIgnoreCase(grade.getGradeTitle())) {
                throw new IllegalArgumentException("Grade title already exists");
            }
        } else if (cbseExamGradeRepository.existsByGradeTitleIgnoreCaseAndIdNot(grade.getGradeTitle(), excludeId)) {
            throw new IllegalArgumentException("Grade title already exists");
        }
        if (grade.getDetails().isEmpty()) {
            throw new IllegalArgumentException("At least one grade row is required");
        }
        for (CbseExamGradeDetail detail : grade.getDetails()) {
            if (detail.getGradeName().isBlank()) {
                throw new IllegalArgumentException("Grade name is required for each row");
            }
            if (detail.getMaxPercentage() == null || detail.getMinPercentage() == null) {
                throw new IllegalArgumentException("Maximum and minimum percentage are required");
            }
            if (detail.getMaxPercentage() < detail.getMinPercentage()) {
                throw new IllegalArgumentException("Maximum percentage must be greater than or equal to minimum percentage");
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

    private Map<String, Object> toResponse(CbseExamGrade grade) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", grade.getId());
        map.put("gradeTitle", grade.getGradeTitle());
        map.put("description", grade.getDescription() != null ? grade.getDescription() : "");
        map.put("details", grade.getDetails().stream().map(this::toDetailResponse).toList());
        return map;
    }

    private Map<String, Object> toDetailResponse(CbseExamGradeDetail detail) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", detail.getId());
        map.put("gradeName", detail.getGradeName());
        map.put("maxPercentage", detail.getMaxPercentage());
        map.put("minPercentage", detail.getMinPercentage());
        map.put("remark", detail.getRemark() != null ? detail.getRemark() : "");
        map.put("sortOrder", detail.getSortOrder());
        return map;
    }

    private void seedGrades() {
        cbseExamGradeRepository.save(buildGrade(
                "Exam Grade",
                "Default exam grading scale",
                new String[][]{
                        {"A+", "100", "90", "Excellent"},
                        {"A", "90", "80", "Very Good"},
                        {"B+", "80", "70", "Good"},
                        {"B", "70", "60", "Better"},
                        {"C", "60", "50", "Keep Hard Working"},
                        {"D", "50", "40", ""},
                        {"E", "40", "0", ""}
                }
        ));
        cbseExamGradeRepository.save(buildGrade(
                "Exam grade 1",
                "Alternate exam grading scale",
                new String[][]{
                        {"A+", "100", "90", "Excellent"},
                        {"A", "90", "80", "Very Good"},
                        {"B+", "80", "70", "Good"},
                        {"B", "70", "60", "Better"},
                        {"C", "60", "50", "Keep Hard Working"},
                        {"D", "50", "40", ""},
                        {"E", "40", "0", ""}
                }
        ));
    }

    private CbseExamGrade buildGrade(String title, String description, String[][] rows) {
        CbseExamGrade grade = CbseExamGrade.builder()
                .gradeTitle(title)
                .description(description)
                .build();
        int sortOrder = 0;
        for (String[] row : rows) {
            grade.getDetails().add(CbseExamGradeDetail.builder()
                    .cbseExamGrade(grade)
                    .gradeName(row[0])
                    .maxPercentage(Integer.parseInt(row[1]))
                    .minPercentage(Integer.parseInt(row[2]))
                    .remark(row[3])
                    .sortOrder(sortOrder++)
                    .build());
        }
        return grade;
    }
}
