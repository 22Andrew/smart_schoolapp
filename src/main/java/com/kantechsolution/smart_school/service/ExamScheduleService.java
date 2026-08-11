package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ExamGroup;
import com.kantechsolution.smart_school.model.ExamGroupExam;
import com.kantechsolution.smart_school.model.ExamScheduleEntry;
import com.kantechsolution.smart_school.repository.ExamGroupExamRepository;
import com.kantechsolution.smart_school.repository.ExamGroupRepository;
import com.kantechsolution.smart_school.repository.ExamScheduleEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExamScheduleService implements ApplicationRunner {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private static final List<String> DEFAULT_SUBJECTS = List.of(
            "English (210)", "Hindi (230)", "Mathematics (110)",
            "Science (111)", "Social Science (113)", "Computer (114)"
    );

    private final ExamGroupRepository examGroupRepository;
    private final ExamGroupExamRepository examGroupExamRepository;
    private final ExamScheduleEntryRepository examScheduleEntryRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (examScheduleEntryRepository.count() > 0) {
            return;
        }
        seedScheduleEntries();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchSchedule(Long groupId, Long examId) {
        if (groupId == null) {
            throw new IllegalArgumentException("Exam group is required");
        }
        if (examId == null) {
            throw new IllegalArgumentException("Exam is required");
        }

        ExamGroupExam exam = examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found for selected group"));

        return examScheduleEntryRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    private Map<String, Object> toScheduleResponse(ExamScheduleEntry entry) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entry.getId());
        map.put("subject", entry.getSubjectName());
        map.put("dateFrom", entry.getDateFrom() != null ? entry.getDateFrom().format(DATE_FMT) : "");
        map.put("startTime", entry.getStartTime() != null ? entry.getStartTime().format(TIME_FMT) : "");
        map.put("duration", entry.getDurationMinutes());
        map.put("roomNo", entry.getRoomNo() != null ? entry.getRoomNo() : "");
        map.put("marksMax", formatMarks(entry.getMarksMax()));
        map.put("marksMin", formatMarks(entry.getMarksMin()));
        return map;
    }

    private String formatMarks(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return value.stripTrailingZeros().toPlainString();
    }

    private void seedScheduleEntries() {
        examGroupRepository.findByNameIgnoreCase("General Exam (Pass / Fail)").ifPresent(group -> {
            ExamGroupExam exam = findOrCreateExam(group, "CBSE Monthly Test-May");
            if (examScheduleEntryRepository.countByExamGroupExamId(exam.getId()) > 0) {
                return;
            }

            LocalDate examDate = LocalDate.of(2026, 5, 4);
            LocalTime startTime = LocalTime.of(9, 0, 0);
            List<ExamScheduleEntry> entries = new ArrayList<>();

            for (String subject : DEFAULT_SUBJECTS) {
                entries.add(ExamScheduleEntry.builder()
                        .examGroupExam(exam)
                        .subjectName(subject)
                        .dateFrom(examDate)
                        .startTime(startTime)
                        .durationMinutes(60)
                        .roomNo("100")
                        .marksMax(new BigDecimal("100.00"))
                        .marksMin(new BigDecimal("33.00"))
                        .build());
            }
            examScheduleEntryRepository.saveAll(entries);
        });
    }

    private ExamGroupExam findOrCreateExam(ExamGroup group, String examName) {
        return examGroupExamRepository.findByExamGroupIdOrderByIdAsc(group.getId()).stream()
                .filter(exam -> examName.equalsIgnoreCase(exam.getName()))
                .findFirst()
                .orElseGet(() -> {
                    ExamGroupExam exam = ExamGroupExam.builder()
                            .name(examName)
                            .examGroup(group)
                            .build();
                    return examGroupExamRepository.save(exam);
                });
    }
}
