package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentAttendanceEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Order(25)
public class StudentAttendanceProfileSeedService implements ApplicationRunner {

    private static final String[] STATUS_PATTERN = {
            "Present", "Present", "Absent", "Late", "Present", "Holiday", "Half Day",
            "Present", "Late", "Present", "Absent", "Present", "Half Day", "Late",
            "Present", "Holiday", "Present", "Absent", "Late", "Present", "Present",
            "Half Day", "Late", "Present", "Absent", "Holiday", "Present", "Late",
            "Present", "Half Day", "Present"
    };

    private final StudentAttendanceEntryRepository attendanceEntryRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final AcademicSessionService academicSessionService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (attendanceEntryRepository.count() > 0) {
            return;
        }
        seedDemoAttendance();
    }

    private void seedDemoAttendance() {
        List<StudentAdmission> students = studentAdmissionRepository.search(null, null, null, false, null);
        if (students.isEmpty()) {
            return;
        }

        String sessionName = academicSessionService.getCurrentSessionName();
        int startYear = parseSessionStartYear(sessionName);
        int endYear = startYear + 1;

        List<YearMonth> monthsToSeed = List.of(
                YearMonth.of(startYear, Month.APRIL),
                YearMonth.of(startYear, Month.MAY),
                YearMonth.of(startYear, Month.JUNE),
                YearMonth.of(startYear, Month.JULY),
                YearMonth.of(startYear, Month.AUGUST),
                YearMonth.of(startYear, Month.SEPTEMBER),
                YearMonth.of(endYear, Month.JANUARY)
        );

        List<StudentAttendanceEntry> entries = new ArrayList<>();
        for (StudentAdmission student : students) {
            int studentOffset = (int) (student.getId() % STATUS_PATTERN.length);
            for (YearMonth month : monthsToSeed) {
                int daysInMonth = month.lengthOfMonth();
                for (int day = 1; day <= daysInMonth; day++) {
                    int patternIndex = (day + studentOffset) % STATUS_PATTERN.length;
                    String status = STATUS_PATTERN[patternIndex];
                    if (day % 11 == 0 && student.getId() % 2 == 0) {
                        status = "Late With Excuse";
                    }
                    entries.add(StudentAttendanceEntry.builder()
                            .studentAdmissionId(student.getId())
                            .attendanceDate(LocalDate.of(month.getYear(), month.getMonth(), day))
                            .status(status)
                            .source("Manual")
                            .build());
                }
            }
        }

        attendanceEntryRepository.saveAll(entries);
    }

    static int parseSessionStartYear(String sessionName) {
        if (sessionName == null || sessionName.isBlank()) {
            return LocalDate.now().getYear();
        }
        String[] parts = sessionName.trim().split("-");
        if (parts.length >= 1 && parts[0].matches("\\d{4}")) {
            return Integer.parseInt(parts[0]);
        }
        return LocalDate.now().getYear();
    }

    static String statusToCode(String status) {
        if (status == null || status.isBlank()) {
            return "";
        }
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("excuse")) {
            return "E";
        }
        if (normalized.contains("present")) {
            return "P";
        }
        if (normalized.contains("late")) {
            return "L";
        }
        if (normalized.contains("absent")) {
            return "A";
        }
        if (normalized.contains("holiday")) {
            return "H";
        }
        if (normalized.contains("half")) {
            return "F";
        }
        return normalized.length() >= 1 ? normalized.substring(0, 1).toUpperCase(Locale.ROOT) : "";
    }
}
