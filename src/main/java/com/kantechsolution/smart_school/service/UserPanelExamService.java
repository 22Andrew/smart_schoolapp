package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class UserPanelExamService {

    private static final BigDecimal DEFAULT_MIN_MARKS = new BigDecimal("33.00");

    private final UserPanelContextService userPanelContextService;
    private final ExamResultRecordRepository examResultRecordRepository;
    private final ExamScheduleEntryRepository examScheduleEntryRepository;
    private final MarksGradeRepository marksGradeRepository;
    private final MarksDivisionRepository marksDivisionRepository;

    public UserPanelExamService(
            UserPanelContextService userPanelContextService,
            ExamResultRecordRepository examResultRecordRepository,
            ExamScheduleEntryRepository examScheduleEntryRepository,
            MarksGradeRepository marksGradeRepository,
            MarksDivisionRepository marksDivisionRepository
    ) {
        this.userPanelContextService = userPanelContextService;
        this.examResultRecordRepository = examResultRecordRepository;
        this.examScheduleEntryRepository = examScheduleEntryRepository;
        this.marksGradeRepository = marksGradeRepository;
        this.marksDivisionRepository = marksDivisionRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfileExams(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);

        List<ExamResultRecord> records = examResultRecordRepository
                .findPublishedByStudentAdmissionId(student.getId()).stream()
                .filter(this::hasSubjectMarks)
                .sorted(Comparator.comparing(record -> defaultText(record.getExamGroupExam().getName()),
                        String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<Map<String, Object>> exams = new ArrayList<>();
        for (ExamResultRecord record : records) {
            exams.add(toExamPanel(record));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("exams", exams);
        return response;
    }

    private boolean hasSubjectMarks(ExamResultRecord record) {
        return record.getSubjectMarks() != null && !record.getSubjectMarks().isEmpty();
    }

    private Map<String, Object> toExamPanel(ExamResultRecord record) {
        ExamGroupExam exam = record.getExamGroupExam();
        ExamGroup group = exam.getExamGroup();
        String examType = group != null ? defaultText(group.getExamType()) : "";
        boolean passFail = isPassFailType(examType);

        List<ExamScheduleEntry> scheduleEntries = examScheduleEntryRepository
                .findByExamGroupExamIdOrderByIdAsc(exam.getId());
        Map<String, ExamScheduleEntry> scheduleBySubject = indexSchedule(scheduleEntries);

        BigDecimal maxTotal = scheduleEntries.stream()
                .map(ExamScheduleEntry::getMarksMax)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (maxTotal.compareTo(BigDecimal.ZERO) <= 0) {
            maxTotal = record.getSubjectMarks().stream()
                    .map(ExamResultSubjectMark::getMarksMax)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal totalObtain = computeTotalObtain(record);
        BigDecimal percent = record.getPercent();
        if (percent == null && maxTotal.compareTo(BigDecimal.ZERO) > 0) {
            percent = totalObtain.multiply(new BigDecimal("100"))
                    .divide(maxTotal, 2, RoundingMode.HALF_UP);
        }

        List<Map<String, Object>> subjects = new ArrayList<>();
        for (ExamResultSubjectMark mark : record.getSubjectMarks()) {
            ExamScheduleEntry entry = findScheduleEntry(scheduleBySubject, mark);
            BigDecimal marksMax = mark.getMarksMax() != null ? mark.getMarksMax()
                    : (entry != null ? entry.getMarksMax() : null);
            BigDecimal marksMin = entry != null && entry.getMarksMin() != null
                    ? entry.getMarksMin()
                    : DEFAULT_MIN_MARKS;

            Map<String, Object> subject = new LinkedHashMap<>();
            subject.put("name", defaultText(mark.getSubjectName()));
            subject.put("code", defaultText(mark.getSubjectCode()));
            subject.put("max", formatDecimal(marksMax));
            subject.put("min", formatDecimal(marksMin));
            subject.put("obtained", formatObtained(mark));
            subject.put("outcome", resolveOutcome(examType, passFail, mark, marksMin, marksMax));
            subject.put("note", defaultText(mark.getNote()));
            subjects.add(subject);
        }

        String division = resolveDivision(percent);
        String resultStatus = defaultText(record.getResultStatus());
        if (resultStatus.isBlank()) {
            resultStatus = resolveOverallResult(examType, passFail, percent, record, scheduleBySubject);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("grandTotal", formatDecimal(maxTotal));
        summary.put("totalObtain", formatDecimal(totalObtain));
        summary.put("percentage", formatDecimal(percent));
        summary.put("rank", record.getStudentRank() != null ? String.valueOf(record.getStudentRank()) : "");
        summary.put("result", resultStatus);
        summary.put("division", division);

        Map<String, Object> panel = new LinkedHashMap<>();
        panel.put("title", defaultText(exam.getName()));
        panel.put("outcomeColumn", passFail ? "Result" : "Grade");
        panel.put("subjects", subjects);
        panel.put("summary", summary);
        return panel;
    }

    private BigDecimal computeTotalObtain(ExamResultRecord record) {
        if (record.getGrandTotal() != null) {
            return record.getGrandTotal();
        }
        return record.getSubjectMarks().stream()
                .filter(mark -> !Boolean.TRUE.equals(mark.getAbsent()))
                .map(ExamResultSubjectMark::getMarksObtained)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String resolveOutcome(
            String examType,
            boolean passFail,
            ExamResultSubjectMark mark,
            BigDecimal marksMin,
            BigDecimal marksMax
    ) {
        if (Boolean.TRUE.equals(mark.getAbsent())) {
            return passFail ? "Fail" : resolveGradeLabel(examType, BigDecimal.ZERO);
        }

        BigDecimal obtained = mark.getMarksObtained();
        if (passFail) {
            if (obtained != null && marksMin != null && obtained.compareTo(marksMin) >= 0) {
                return "Pass";
            }
            return "Fail";
        }

        if (obtained == null || marksMax == null || marksMax.compareTo(BigDecimal.ZERO) <= 0) {
            return "";
        }
        BigDecimal subjectPercent = obtained.multiply(new BigDecimal("100"))
                .divide(marksMax, 2, RoundingMode.HALF_UP);
        return resolveGradeLabel(examType, subjectPercent);
    }

    private String resolveOverallResult(
            String examType,
            boolean passFail,
            BigDecimal percent,
            ExamResultRecord record,
            Map<String, ExamScheduleEntry> scheduleBySubject
    ) {
        if (passFail) {
            boolean allSubjectsPass = record.getSubjectMarks().stream().allMatch(mark -> {
                if (Boolean.TRUE.equals(mark.getAbsent())) {
                    return false;
                }
                BigDecimal obtained = mark.getMarksObtained();
                if (obtained == null) {
                    return false;
                }
                ExamScheduleEntry entry = findScheduleEntry(scheduleBySubject, mark);
                BigDecimal min = entry != null && entry.getMarksMin() != null
                        ? entry.getMarksMin()
                        : DEFAULT_MIN_MARKS;
                return obtained.compareTo(min) >= 0;
            });
            return allSubjectsPass ? "Pass" : "Fail";
        }

        if (percent == null) {
            return "";
        }
        return percent.doubleValue() >= 33.0 ? "Pass" : "Fail";
    }

    private String resolveGradeLabel(String examType, BigDecimal percent) {
        if (percent == null || examType.isBlank()) {
            return "";
        }
        double value = percent.doubleValue();
        return marksGradeRepository.findAllByOrderByExamTypeAscPercentFromAsc().stream()
                .filter(grade -> examType.equalsIgnoreCase(grade.getExamType()))
                .filter(grade -> value >= grade.getPercentFrom() && value <= grade.getPercentUpto())
                .map(MarksGrade::getGradeName)
                .findFirst()
                .orElse("");
    }

    private String resolveDivision(BigDecimal percent) {
        if (percent == null) {
            return "";
        }
        double value = percent.doubleValue();
        return marksDivisionRepository.findAllByOrderByPercentFromDesc().stream()
                .filter(division -> value <= division.getPercentFrom() && value >= division.getPercentUpto())
                .map(MarksDivision::getDivisionName)
                .findFirst()
                .orElse("");
    }

    private Map<String, ExamScheduleEntry> indexSchedule(List<ExamScheduleEntry> entries) {
        Map<String, ExamScheduleEntry> map = new LinkedHashMap<>();
        for (ExamScheduleEntry entry : entries) {
            map.put(normalizeSubjectKey(entry.getSubjectName()), entry);
        }
        return map;
    }

    private ExamScheduleEntry findScheduleEntry(Map<String, ExamScheduleEntry> scheduleBySubject, ExamResultSubjectMark mark) {
        ExamScheduleEntry entry = scheduleBySubject.get(normalizeSubjectKey(mark.getSubjectName()));
        if (entry != null) {
            return entry;
        }
        if (mark.getSubjectCode() != null && !mark.getSubjectCode().isBlank()) {
            for (ExamScheduleEntry candidate : scheduleBySubject.values()) {
                if (candidate.getSubjectName() != null
                        && candidate.getSubjectName().contains("(" + mark.getSubjectCode() + ")")) {
                    return candidate;
                }
            }
        }
        return null;
    }

    private String normalizeSubjectKey(String name) {
        if (name == null) {
            return "";
        }
        int paren = name.indexOf('(');
        return (paren > 0 ? name.substring(0, paren) : name).trim().toLowerCase(Locale.ROOT);
    }

    private boolean isPassFailType(String examType) {
        String normalized = examType.toLowerCase(Locale.ROOT);
        return normalized.contains("pass/fail") || normalized.contains("general purpose");
    }

    private String formatObtained(ExamResultSubjectMark mark) {
        if (Boolean.TRUE.equals(mark.getAbsent())) {
            return "ABS";
        }
        return formatDecimal(mark.getMarksObtained());
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String defaultText(String value) {
        return value == null ? "" : value.trim();
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }
}
