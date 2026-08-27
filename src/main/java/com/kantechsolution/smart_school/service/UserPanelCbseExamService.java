package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserPanelCbseExamService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final UserPanelContextService userPanelContextService;
    private final CbseExamRepository cbseExamRepository;
    private final CbseExamStudentRepository cbseExamStudentRepository;
    private final CbseExamSubjectRepository cbseExamSubjectRepository;
    private final CbseExamStudentMarkRepository cbseExamStudentMarkRepository;
    private final CbseExamRankRepository cbseExamRankRepository;
    private final CbseExamGradeRepository cbseExamGradeRepository;

    public UserPanelCbseExamService(
            UserPanelContextService userPanelContextService,
            CbseExamRepository cbseExamRepository,
            CbseExamStudentRepository cbseExamStudentRepository,
            CbseExamSubjectRepository cbseExamSubjectRepository,
            CbseExamStudentMarkRepository cbseExamStudentMarkRepository,
            CbseExamRankRepository cbseExamRankRepository,
            CbseExamGradeRepository cbseExamGradeRepository
    ) {
        this.userPanelContextService = userPanelContextService;
        this.cbseExamRepository = cbseExamRepository;
        this.cbseExamStudentRepository = cbseExamStudentRepository;
        this.cbseExamSubjectRepository = cbseExamSubjectRepository;
        this.cbseExamStudentMarkRepository = cbseExamStudentMarkRepository;
        this.cbseExamRankRepository = cbseExamRankRepository;
        this.cbseExamGradeRepository = cbseExamGradeRepository;
    }

    @Transactional
    public Map<String, Object> getProfileCbseExams(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);

        List<Map<String, Object>> exams = new ArrayList<>();
        for (CbseExam exam : resolveExamsForStudent(student, true)) {
            Map<String, Object> panel = toExamPanel(exam, student.getId());
            if (panel != null) {
                exams.add(panel);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("exams", exams);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentTimetable(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);

        List<Map<String, Object>> exams = new ArrayList<>();
        for (CbseExam exam : resolveExamsForStudent(student, false)) {
            List<CbseExamSubject> subjects = cbseExamSubjectRepository
                    .findByCbseExamIdOrderByIdAsc(exam.getId());
            if (subjects.isEmpty()) {
                continue;
            }

            List<Map<String, Object>> rows = new ArrayList<>();
            for (CbseExamSubject subject : subjects) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("subjectName", defaultText(subject.getSubjectName()));
                row.put("examDate", subject.getExamDate() != null ? subject.getExamDate().format(DATE_FMT) : "");
                row.put("startTime", subject.getStartTime() != null ? subject.getStartTime().format(TIME_FMT) : "");
                row.put("durationMinutes", subject.getDurationMinutes() != null ? subject.getDurationMinutes() : "");
                row.put("roomNo", defaultText(subject.getRoomNo()));
                rows.add(row);
            }

            Map<String, Object> group = new LinkedHashMap<>();
            group.put("id", exam.getId());
            group.put("title", defaultText(exam.getExamName()));
            group.put("subjects", rows);
            exams.add(group);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("exams", exams);
        return response;
    }

    private List<CbseExam> resolveExamsForStudent(StudentAdmission student, boolean resultExams) {
        List<CbseExamStudent> assignments = resultExams
                ? cbseExamStudentRepository.findPublishedAssignmentsForStudent(student.getId())
                : cbseExamStudentRepository.findPublishedScheduleAssignmentsForStudent(student.getId());
        Set<Long> assignedExamIds = assignments.stream()
                .map(assignment -> assignment.getCbseExam() != null ? assignment.getCbseExam().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String className = student.getSchoolClass() != null
                ? defaultText(student.getSchoolClass().getName())
                : "";
        String section = defaultText(student.getSection());

        List<CbseExam> exams = new ArrayList<>();
        for (CbseExam exam : cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc()) {
            if (resultExams ? !exam.isPublishResult() : !exam.isPublished()) {
                continue;
            }
            if (assignedExamIds.contains(exam.getId()) || matchesClassSection(exam, className, section)) {
                exams.add(exam);
            }
        }
        return exams;
    }

    private boolean matchesClassSection(CbseExam exam, String className, String section) {
        if (className.isBlank() || !className.equalsIgnoreCase(defaultText(exam.getClassName()))) {
            return false;
        }
        if (section.isBlank()) {
            return true;
        }
        String sections = defaultText(exam.getSections());
        for (String part : sections.split(",")) {
            if (section.equalsIgnoreCase(part.trim())) {
                return true;
            }
        }
        return false;
    }

    private Map<String, Object> toExamPanel(CbseExam exam, Long studentId) {
        List<CbseExamStudentMark> marks = cbseExamStudentMarkRepository
                .findByExamAndStudent(exam.getId(), studentId);
        if (marks.isEmpty()) {
            return null;
        }

        List<CbseExamSubject> subjects = cbseExamSubjectRepository
                .findByCbseExamIdOrderByIdAsc(exam.getId());
        if (subjects.isEmpty()) {
            return null;
        }

        List<CbseExamStudentMarkSeedService.AssessmentDef> columnDefs =
                CbseExamStudentMarkSeedService.parseAssessments(subjects.get(0).getAssessments());

        List<Map<String, Object>> columns = new ArrayList<>();
        for (CbseExamStudentMarkSeedService.AssessmentDef def : columnDefs) {
            Map<String, Object> column = new LinkedHashMap<>();
            column.put("key", def.key());
            column.put("label", def.label());
            column.put("max", def.maxMarks());
            columns.add(column);
        }

        Map<String, Map<String, CbseExamStudentMark>> marksBySubjectAndKey = marks.stream()
                .collect(Collectors.groupingBy(
                        CbseExamStudentMark::getSubjectName,
                        LinkedHashMap::new,
                        Collectors.toMap(CbseExamStudentMark::getAssessmentKey, mark -> mark,
                                (left, right) -> left, LinkedHashMap::new)
                ));

        int maxTotal = 0;
        BigDecimal obtainedTotal = BigDecimal.ZERO;
        List<Map<String, Object>> subjectRows = new ArrayList<>();

        for (CbseExamSubject subject : subjects) {
            CbseExamStudentMarkSeedService.SubjectParts parts =
                    CbseExamStudentMarkSeedService.parseSubjectName(subject.getSubjectName());
            Map<String, CbseExamStudentMark> subjectMarks = marksBySubjectAndKey
                    .getOrDefault(subject.getSubjectName(), Map.of());

            BigDecimal subjectTotal = BigDecimal.ZERO;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", parts.name());
            row.put("code", parts.code());

            for (CbseExamStudentMarkSeedService.AssessmentDef def : columnDefs) {
                CbseExamStudentMark mark = subjectMarks.get(def.key());
                maxTotal += def.maxMarks();
                if (mark != null) {
                    if (Boolean.TRUE.equals(mark.getAbsent())) {
                        row.put(def.key(), "ABS");
                    } else if (mark.getMarksObtained() != null) {
                        row.put(def.key(), formatDecimal(mark.getMarksObtained()));
                        subjectTotal = subjectTotal.add(mark.getMarksObtained());
                    } else {
                        row.put(def.key(), "");
                    }
                } else {
                    row.put(def.key(), "");
                }
            }

            obtainedTotal = obtainedTotal.add(subjectTotal);
            row.put("total", formatDecimal(subjectTotal));
            row.put("note", "");
            subjectRows.add(row);
        }

        BigDecimal percentage = maxTotal > 0
                ? obtainedTotal.multiply(new BigDecimal("100"))
                .divide(new BigDecimal(maxTotal), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Integer rank = cbseExamRankRepository
                .findByCbseExamIdAndStudentAdmissionId(exam.getId(), studentId)
                .map(CbseExamRank::getStudentRank)
                .orElse(null);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalMarks", formatSummaryTotal(obtainedTotal) + "/" + maxTotal);
        summary.put("percentage", formatDecimal(percentage));
        summary.put("grade", resolveGrade(exam.getGrade(), percentage));
        summary.put("rank", rank);

        Map<String, Object> panel = new LinkedHashMap<>();
        panel.put("title", defaultText(exam.getExamName()));
        panel.put("columns", columns);
        panel.put("subjects", subjectRows);
        panel.put("summary", summary);
        return panel;
    }

    private String resolveGrade(String gradeTitle, BigDecimal percentage) {
        if (percentage == null) {
            return "";
        }
        double value = percentage.doubleValue();
        Optional<CbseExamGrade> grade = cbseExamGradeRepository.findByGradeTitleIgnoreCase(defaultText(gradeTitle));
        if (grade.isEmpty() || grade.get().getDetails() == null) {
            return fallbackGrade(value);
        }
        for (CbseExamGradeDetail detail : grade.get().getDetails()) {
            if (detail.getMinPercentage() == null || detail.getMaxPercentage() == null) {
                continue;
            }
            if (value >= detail.getMinPercentage() && value <= detail.getMaxPercentage()) {
                return defaultText(detail.getGradeName());
            }
        }
        return fallbackGrade(value);
    }

    private String fallbackGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 40) return "D";
        return "E";
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String formatSummaryTotal(BigDecimal value) {
        if (value == null) {
            return "";
        }
        BigDecimal scaled = value.setScale(2, RoundingMode.HALF_UP);
        if (scaled.stripTrailingZeros().scale() <= 0) {
            return scaled.toBigInteger().toString();
        }
        return scaled.toPlainString();
    }

    private String defaultText(String value) {
        return value == null ? "" : value.trim();
    }
}
