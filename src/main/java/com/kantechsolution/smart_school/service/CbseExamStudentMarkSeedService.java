package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Order(20)
public class CbseExamStudentMarkSeedService implements ApplicationRunner {

    private static final Pattern SUBJECT_CODE_PATTERN = Pattern.compile("^(.+?)\\s*\\(([^)]+)\\)$");

    private final CbseExamRepository cbseExamRepository;
    private final CbseExamSubjectRepository cbseExamSubjectRepository;
    private final CbseExamStudentRepository cbseExamStudentRepository;
    private final CbseExamStudentMarkRepository cbseExamStudentMarkRepository;
    private final CbseExamRankRepository cbseExamRankRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (cbseExamStudentMarkRepository.count() > 0) {
            return;
        }
        List<CbseExam> exams = cbseExamRepository.findAllByOrderByCreatedAtDescIdDesc();
        for (CbseExam exam : exams) {
            if (!exam.isPublishResult()) {
                continue;
            }
            ensureStudentsAssigned(exam);
            seedMarksForExam(exam);
            ensureRanks(exam);
        }
    }

    private void ensureStudentsAssigned(CbseExam exam) {
        List<CbseExamStudent> existing = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(exam.getId());
        if (!existing.isEmpty()) {
            return;
        }

        Long classId = resolveClassId(exam.getClassName());
        if (classId == null) {
            return;
        }

        String[] sections = exam.getSections().split(",");
        Set<Long> assigned = new LinkedHashSet<>();
        for (String sectionPart : sections) {
            String section = sectionPart.trim();
            if (section.isBlank()) {
                continue;
            }
            studentAdmissionRepository.search(classId, section, null, false, null).stream()
                    .map(StudentAdmission::getId)
                    .forEach(assigned::add);
        }

        for (Long studentId : assigned) {
            exam.getStudents().add(CbseExamStudent.builder()
                    .cbseExam(exam)
                    .studentAdmissionId(studentId)
                    .assigned(true)
                    .build());
        }
        if (!assigned.isEmpty()) {
            cbseExamRepository.save(exam);
        }
    }

    private void seedMarksForExam(CbseExam exam) {
        if (cbseExamStudentMarkRepository.existsByCbseExamId(exam.getId())) {
            return;
        }

        List<CbseExamSubject> subjects = cbseExamSubjectRepository.findByCbseExamIdOrderByIdAsc(exam.getId());
        if (subjects.isEmpty()) {
            return;
        }

        List<CbseExamStudent> assigned = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(exam.getId());
        if (assigned.isEmpty()) {
            return;
        }

        List<List<String>> markSets = List.of(
                List.of("78.00", "56.00", "76.00", "67.00", "87.00", "46.00", "8.00", "18.00", "11.00"),
                List.of("87.00", "35.00", "87.00", "45.00", "88.00", "35.00", "8.00", "18.00", "11.00"),
                List.of("56.00", "46.00", "56.00", "72.00", "35.00", "ABS", "8.00", "18.00", "11.00")
        );

        List<CbseExamStudentMark> marks = new ArrayList<>();
        for (int studentIndex = 0; studentIndex < assigned.size(); studentIndex++) {
            CbseExamStudent assignment = assigned.get(studentIndex);
            List<String> sourceMarks = markSets.get(Math.min(studentIndex, markSets.size() - 1));
            int markPointer = 0;

            for (CbseExamSubject subject : subjects) {
                List<AssessmentDef> assessments = parseAssessments(subject.getAssessments());
                for (int order = 0; order < assessments.size(); order++) {
                    AssessmentDef assessment = assessments.get(order);
                    String raw = markPointer < sourceMarks.size() ? sourceMarks.get(markPointer) : "0.00";
                    markPointer++;

                    boolean absent = "ABS".equalsIgnoreCase(raw);
                    BigDecimal obtained = absent ? null : new BigDecimal(raw);

                    marks.add(CbseExamStudentMark.builder()
                            .cbseExam(exam)
                            .studentAdmissionId(assignment.getStudentAdmissionId())
                            .subjectName(subject.getSubjectName())
                            .assessmentLabel(assessment.label())
                            .assessmentKey(assessment.key())
                            .maxMarks(assessment.maxMarks())
                            .marksObtained(obtained)
                            .absent(absent)
                            .assessmentOrder(order)
                            .build());
                }
            }
        }

        cbseExamStudentMarkRepository.saveAll(marks);
    }

    private void ensureRanks(CbseExam exam) {
        if (!cbseExamRankRepository.findByCbseExamIdOrderByStudentRankAsc(exam.getId()).isEmpty()) {
            return;
        }

        List<CbseExamStudent> assigned = cbseExamStudentRepository.findByCbseExamIdOrderByIdAsc(exam.getId());
        if (assigned.isEmpty()) {
            return;
        }

        List<CbseExamStudentMark> allMarks = cbseExamStudentMarkRepository.findByCbseExamId(exam.getId());
        Map<Long, BigDecimal> totalsByStudent = new LinkedHashMap<>();
        for (CbseExamStudent assignment : assigned) {
            BigDecimal total = allMarks.stream()
                    .filter(mark -> assignment.getStudentAdmissionId().equals(mark.getStudentAdmissionId()))
                    .filter(mark -> !Boolean.TRUE.equals(mark.getAbsent()))
                    .map(CbseExamStudentMark::getMarksObtained)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalsByStudent.put(assignment.getStudentAdmissionId(), total);
        }

        List<Map.Entry<Long, BigDecimal>> sorted = totalsByStudent.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .toList();

        cbseExamRankRepository.deleteByCbseExamId(exam.getId());
        int rank = 1;
        List<CbseExamRank> ranks = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : sorted) {
            ranks.add(CbseExamRank.builder()
                    .cbseExam(exam)
                    .studentAdmissionId(entry.getKey())
                    .studentRank(rank++)
                    .build());
        }
        cbseExamRankRepository.saveAll(ranks);
        exam.setRankGenerated(true);
        cbseExamRepository.save(exam);
    }

    private Long resolveClassId(String className) {
        if (className == null || className.isBlank()) {
            return null;
        }
        return schoolClassRepository.findByNameIgnoreCase(className.trim())
                .map(SchoolClass::getId)
                .orElse(null);
    }

    static List<AssessmentDef> parseAssessments(String assessments) {
        String source = assessments == null || assessments.isBlank()
                ? "Theory (TH02), Practical (PC03)"
                : assessments;
        List<AssessmentDef> parsed = new ArrayList<>();
        int order = 0;
        for (String part : source.split(",")) {
            String label = part.trim();
            if (label.isEmpty()) {
                continue;
            }
            parsed.add(new AssessmentDef(assessmentKey(label), label, defaultMaxMarks(label), order++));
        }
        if (parsed.isEmpty()) {
            parsed.add(new AssessmentDef("theory", "Theory (TH02)", 100, 0));
            parsed.add(new AssessmentDef("practical", "Practical (PC03)", 75, 1));
        }
        return parsed;
    }

    static String assessmentKey(String label) {
        String lower = label.toLowerCase(Locale.ROOT);
        if (lower.contains("theory")) {
            return "theory";
        }
        if (lower.contains("practical")) {
            return "practical";
        }
        if (lower.contains("assignment")) {
            return "assignment";
        }
        return lower.replaceAll("[^a-z0-9]+", "_").replaceAll("^_|_$", "");
    }

    private static int defaultMaxMarks(String label) {
        String lower = label.toLowerCase(Locale.ROOT);
        if (lower.contains("assignment")) {
            return 20;
        }
        if (lower.contains("practical")) {
            return 75;
        }
        return 100;
    }

    static SubjectParts parseSubjectName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new SubjectParts("", "");
        }
        Matcher matcher = SUBJECT_CODE_PATTERN.matcher(fullName.trim());
        if (matcher.matches()) {
            return new SubjectParts(matcher.group(1).trim(), matcher.group(2).trim());
        }
        return new SubjectParts(fullName.trim(), "");
    }

    record AssessmentDef(String key, String label, int maxMarks, int order) {
    }

    record SubjectParts(String name, String code) {
    }
}
