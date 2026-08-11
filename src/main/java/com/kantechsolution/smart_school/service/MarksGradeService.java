package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.MarksGrade;
import com.kantechsolution.smart_school.repository.MarksGradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarksGradeService implements ApplicationRunner {

    private static final List<String> EXAM_TYPES = List.of(
            "General Purpose (Pass/Fail)",
            "School Based Grading System",
            "College Based Grading System"
    );

    private final MarksGradeRepository marksGradeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (marksGradeRepository.count() > 0) {
            return;
        }
        seedGrades();
    }

    @Transactional(readOnly = true)
    public List<String> getExamTypes() {
        return EXAM_TYPES;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllGrades() {
        return marksGradeRepository.findAllByOrderByExamTypeAscPercentFromAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGradeById(Long id) {
        return toResponse(requireGrade(id));
    }

    @Transactional
    public Map<String, Object> createGrade(Map<String, Object> body) {
        MarksGrade grade = mapGrade(new MarksGrade(), body);
        validateGrade(grade, null);
        return toResponse(marksGradeRepository.save(grade));
    }

    @Transactional
    public Map<String, Object> updateGrade(Long id, Map<String, Object> body) {
        MarksGrade grade = requireGrade(id);
        mapGrade(grade, body);
        validateGrade(grade, id);
        return toResponse(marksGradeRepository.save(grade));
    }

    @Transactional
    public void deleteGrade(Long id) {
        if (!marksGradeRepository.existsById(id)) {
            throw new RuntimeException("Marks grade not found with ID: " + id);
        }
        marksGradeRepository.deleteById(id);
    }

    private MarksGrade requireGrade(Long id) {
        return marksGradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marks grade not found with ID: " + id));
    }

    private void validateGrade(MarksGrade grade, Long id) {
        if (grade.getExamType() == null || grade.getExamType().isBlank()) {
            throw new IllegalArgumentException("Exam type is required");
        }
        if (grade.getGradeName() == null || grade.getGradeName().isBlank()) {
            throw new IllegalArgumentException("Grade name is required");
        }
        if (grade.getPercentFrom() == null || grade.getPercentUpto() == null) {
            throw new IllegalArgumentException("Percent from and percent upto are required");
        }
        if (grade.getPercentFrom() > grade.getPercentUpto()) {
            throw new IllegalArgumentException("Percent from cannot be greater than percent upto");
        }
        if (grade.getGradePoint() == null) {
            throw new IllegalArgumentException("Grade point is required");
        }
        boolean exists = id == null
                ? marksGradeRepository.existsByExamTypeIgnoreCaseAndGradeNameIgnoreCase(
                        grade.getExamType(), grade.getGradeName())
                : marksGradeRepository.existsByExamTypeIgnoreCaseAndGradeNameIgnoreCaseAndIdNot(
                        grade.getExamType(), grade.getGradeName(), id);
        if (exists) {
            throw new IllegalArgumentException("Grade name already exists for this exam type");
        }
    }

    private MarksGrade mapGrade(MarksGrade grade, Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Grade data is required");
        }
        grade.setExamType(text(body.get("examType")));
        grade.setGradeName(text(body.get("gradeName")));
        grade.setPercentFrom(number(body.get("percentFrom")));
        grade.setPercentUpto(number(body.get("percentUpto")));
        grade.setGradePoint(number(body.get("gradePoint")));
        grade.setDescription(text(body.get("description")));
        return grade;
    }

    private Map<String, Object> toResponse(MarksGrade grade) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", grade.getId());
        map.put("examType", grade.getExamType());
        map.put("gradeName", grade.getGradeName());
        map.put("percentFrom", grade.getPercentFrom());
        map.put("percentUpto", grade.getPercentUpto());
        map.put("gradePoint", grade.getGradePoint());
        map.put("description", grade.getDescription() != null ? grade.getDescription() : "");
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Double number(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Double.parseDouble(String.valueOf(value).trim());
    }

    private void seedGrades() {
        seedType("General Purpose (Pass/Fail)", new String[][]{
                {"Fail", "0", "40", "0"},
                {"Pass", "40.01", "100", "1"}
        });
        seedType("School Based Grading System", new String[][]{
                {"E", "0", "32", "0"},
                {"D", "33", "40", "1"},
                {"C2", "41", "50", "2"},
                {"C1", "51", "60", "3"},
                {"B2", "61", "70", "4"},
                {"B1", "71", "80", "5"},
                {"A2", "81", "90", "6"},
                {"A1", "91", "100", "7"}
        });
        seedType("College Based Grading System", new String[][]{
                {"F", "0", "40", "0"},
                {"D", "41", "50", "2"},
                {"C", "51", "60", "3"},
                {"B-", "61", "70", "4"},
                {"B", "71", "80", "5"},
                {"B+", "81", "85", "6"},
                {"A", "86", "90", "7"},
                {"A+", "91", "95", "8"},
                {"A++", "96", "100", "9"}
        });
    }

    private void seedType(String examType, String[][] rows) {
        for (String[] row : rows) {
            marksGradeRepository.save(MarksGrade.builder()
                    .examType(examType)
                    .gradeName(row[0])
                    .percentFrom(Double.parseDouble(row[1]))
                    .percentUpto(Double.parseDouble(row[2]))
                    .gradePoint(Double.parseDouble(row[3]))
                    .description("")
                    .build());
        }
    }
}
