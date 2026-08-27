package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffAttendanceEntry;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.StaffAttendanceEntryRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentAttendanceEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final LoginPageService loginPageService;
    private final AcademicSessionService academicSessionService;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StudentAttendanceEntryRepository studentAttendanceEntryRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StaffAttendanceEntryRepository staffAttendanceEntryRepository;
    private final NoticeBoardRepository noticeBoardRepository;

    public AdminDashboardService(LoginPageService loginPageService,
                                 AcademicSessionService academicSessionService,
                                 StudentAdmissionRepository studentAdmissionRepository,
                                 StudentAttendanceEntryRepository studentAttendanceEntryRepository,
                                 StaffMemberRepository staffMemberRepository,
                                 StaffAttendanceEntryRepository staffAttendanceEntryRepository,
                                 NoticeBoardRepository noticeBoardRepository) {
        this.loginPageService = loginPageService;
        this.academicSessionService = academicSessionService;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.studentAttendanceEntryRepository = studentAttendanceEntryRepository;
        this.staffMemberRepository = staffMemberRepository;
        this.staffAttendanceEntryRepository = staffAttendanceEntryRepository;
        this.noticeBoardRepository = noticeBoardRepository;
    }

    @Transactional(readOnly = true)
    public void populateDashboard(Model model) {
        loginPageService.populateLoginModel(model);
        model.addAttribute("appName", model.getAttribute("schoolName"));
        model.addAttribute("currentSession", academicSessionService.getCurrentSessionName());
        model.addAttribute("noticeCount", noticeBoardRepository.count());

        LocalDate today = LocalDate.now();
        List<StudentAdmission> activeStudents = studentAdmissionRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        long totalStudents = activeStudents.size();
        List<Long> studentIds = activeStudents.stream().map(StudentAdmission::getId).toList();

        List<StudentAttendanceEntry> todayEntries = studentIds.isEmpty()
                ? List.of()
                : studentAttendanceEntryRepository.findByAttendanceDateAndStudentAdmissionIdIn(today, studentIds);

        long presentCount = countStudentStatus(todayEntries, "Present");
        long lateCount = countStudentStatus(todayEntries, "Late");
        long absentCount = countStudentStatus(todayEntries, "Absent");
        long halfDayCount = countStudentStatus(todayEntries, "Half Day");

        model.addAttribute("totalStudents", totalStudents);
        model.addAttribute("studentPresentToday", presentCount);
        model.addAttribute("studentPresentTodayLabel", presentCount + "/" + totalStudents);
        model.addAttribute("studentPresentTodayPercent", formatPercent(percent(presentCount, totalStudents)));
        model.addAttribute("studentTodayAttendance", buildAttendanceRows(
                totalStudents, presentCount, lateCount, absentCount, halfDayCount));

        List<StaffMember> activeStaff = staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        long totalStaff = activeStaff.size();
        List<Long> staffIds = activeStaff.stream().map(StaffMember::getId).toList();
        List<StaffAttendanceEntry> staffTodayEntries = staffIds.isEmpty()
                ? List.of()
                : staffAttendanceEntryRepository.findByAttendanceDateAndStaffMemberIdIn(today, staffIds);
        long staffPresent = staffTodayEntries.stream()
                .filter(entry -> isStatus(entry.getStatus(), "Present"))
                .count();

        model.addAttribute("totalStaff", totalStaff);
        model.addAttribute("staffPresentTodayLabel", staffPresent + "/" + totalStaff);
        model.addAttribute("totalTeachers", countStaffByRole(activeStaff, "Teacher"));
    }

    private List<Map<String, Object>> buildAttendanceRows(long totalStudents,
                                                          long present,
                                                          long late,
                                                          long absent,
                                                          long halfDay) {
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(attendanceRow("PRESENT", present, totalStudents));
        rows.add(attendanceRow("LATE", late, totalStudents));
        rows.add(attendanceRow("ABSENT", absent, totalStudents));
        rows.add(attendanceRow("HALF DAY", halfDay, totalStudents));
        return rows;
    }

    private Map<String, Object> attendanceRow(String label, long count, long totalStudents) {
        double percent = percent(count, totalStudents);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("count", count);
        row.put("percent", formatPercent(percent));
        row.put("percentValue", percent);
        return row;
    }

    private long countStaffByRole(List<StaffMember> staff, String roleKeyword) {
        return staff.stream()
                .filter(member -> member.getRoles() != null
                        && member.getRoles().toLowerCase(Locale.ROOT).contains(roleKeyword.toLowerCase(Locale.ROOT)))
                .count();
    }

    private long countStudentStatus(List<StudentAttendanceEntry> entries, String status) {
        return entries.stream()
                .filter(entry -> isStatus(entry.getStatus(), status))
                .count();
    }

    private boolean isStatus(String actual, String expected) {
        return actual != null && actual.trim().equalsIgnoreCase(expected);
    }

    private double percent(long count, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return count * 100.0 / total;
    }

    private String formatPercent(double value) {
        return String.format(Locale.US, "%.2f", value);
    }
}
