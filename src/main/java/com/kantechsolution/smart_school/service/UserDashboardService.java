package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDashboardService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final LoginPageService loginPageService;
    private final AcademicSessionService academicSessionService;
    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final NoticeBoardRepository noticeBoardRepository;
    private final HomeworkRepository homeworkRepository;

    @Transactional(readOnly = true)
    public void populateDashboardModel(Model model, Authentication authentication) {
        loginPageService.populateLoginModel(model);

        String username = authentication != null ? authentication.getName() : "";
        AppUserAccount account = appUserAccountRepository.findByUsernameIgnoreCase(username).orElse(null);
        StudentAdmission student = resolveStudent(account);

        String studentName = resolveStudentName(student);
        String admissionNo = resolveAdmissionNo(student);
        String classLabel = resolveClassLabel(student);

        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("activeMenu", "dashboard");
        model.addAttribute("userRole", account != null ? account.getUserType() : "STUDENT");
        model.addAttribute("username", username);
        model.addAttribute("studentName", studentName);
        model.addAttribute("admissionNo", admissionNo);
        model.addAttribute("classLabel", classLabel);
        model.addAttribute("attendancePercent", "81.82");
        model.addAttribute("minAttendancePercent", "75.00");
        model.addAttribute("currentSession", resolveCurrentSession());
        model.addAttribute("noticeCount", resolveNoticeCount());
        model.addAttribute("notices", resolveNotices());
        model.addAttribute("subjectProgress", demoSubjectProgress());
        model.addAttribute("upcomingClasses", demoUpcomingClasses());
        model.addAttribute("homeworkItems", resolveHomework(student));
        model.addAttribute("teachers", demoTeachers());
        model.addAttribute("visitors", demoVisitors());
        model.addAttribute("libraryIssues", demoLibraryIssues());
        model.addAttribute("profileImageUrl", resolveProfileImage(studentName));
    }

    private StudentAdmission resolveStudent(AppUserAccount account) {
        if (account == null || account.getSourceId() == null) {
            return studentAdmissionRepository.findById(1L).orElse(null);
        }
        return studentAdmissionRepository.findById(account.getSourceId()).orElse(null);
    }

    private String resolveStudentName(StudentAdmission student) {
        if (student == null) {
            return "Edward Thomas";
        }
        String first = Optional.ofNullable(student.getFirstName()).orElse("").trim();
        String last = Optional.ofNullable(student.getLastName()).orElse("").trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "Edward Thomas" : full;
    }

    private String resolveAdmissionNo(StudentAdmission student) {
        if (student != null && student.getAdmissionNo() != null && !student.getAdmissionNo().isBlank()) {
            return student.getAdmissionNo().trim();
        }
        return "1000011";
    }

    private String resolveClassLabel(StudentAdmission student) {
        if (student == null || student.getSchoolClass() == null) {
            return "Class 1 (A)";
        }
        String className = student.getSchoolClass().getName();
        String section = student.getSection() == null ? "" : student.getSection().trim();
        if (section.isBlank()) {
            return className;
        }
        return className + " (" + section + ")";
    }

    private String resolveCurrentSession() {
        Object name = academicSessionService.getCurrentSession().get("sessionName");
        return name != null ? String.valueOf(name) : "2026-27";
    }

    private long resolveNoticeCount() {
        long count = noticeBoardRepository.count();
        return count > 0 ? count : 26L;
    }

    private List<Map<String, Object>> resolveNotices() {
        List<NoticeBoard> rows = noticeBoardRepository.findAllByOrderByNoticeDateDescCreatedAtDesc();
        if (!rows.isEmpty()) {
            List<Map<String, Object>> items = new ArrayList<>();
            int limit = Math.min(rows.size(), 8);
            for (int i = 0; i < limit; i++) {
                NoticeBoard row = rows.get(i);
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("title", row.getTitle());
                item.put("date", row.getNoticeDate() != null ? row.getNoticeDate().format(US_DATE) : "");
                items.add(item);
            }
            return items;
        }
        return demoNotices();
    }

    private List<Map<String, Object>> resolveHomework(StudentAdmission student) {
        List<Homework> rows = homeworkRepository.findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc();
        if (!rows.isEmpty()) {
            List<Map<String, Object>> items = new ArrayList<>();
            int limit = Math.min(rows.size(), 5);
            for (int i = 0; i < limit; i++) {
                Homework row = rows.get(i);
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("subject", row.getSubjectName() + " (" + row.getSubjectGroupName() + ")");
                item.put("homeworkDate", row.getHomeworkDate() != null ? row.getHomeworkDate().format(US_DATE) : "");
                item.put("submissionDate", row.getSubmissionDate() != null ? row.getSubmissionDate().format(US_DATE) : "");
                item.put("status", "Pending");
                items.add(item);
            }
            return items;
        }
        return demoHomework();
    }

    private String resolveProfileImage(String studentName) {
        String encoded = studentName.replace(" ", "+");
        return "https://ui-avatars.com/api/?name=" + encoded + "&background=e2e8f0&color=64748b&size=128";
    }

    private List<Map<String, Object>> demoNotices() {
        return List.of(
                notice("Notice for new Book collection", "08/18/2026"),
                notice("Fee Submission Reminder", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026"),
                notice("Notice for new Book collection", "08/06/2026")
        );
    }

    private Map<String, Object> notice(String title, String date) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", title);
        item.put("date", date);
        return item;
    }

    private List<Map<String, Object>> demoSubjectProgress() {
        return List.of(
                progress("English", 68),
                progress("Hindi", 0),
                progress("Mathematics", 0),
                progress("Science", 100),
                progress("Social Studies", 100)
        );
    }

    private Map<String, Object> progress(String subject, int percent) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("subject", subject);
        item.put("percent", percent);
        return item;
    }

    private List<Map<String, Object>> demoUpcomingClasses() {
        return List.of(
                upcoming("Shivam Verma", "9002", "English (210)", "100", "8:00 AM-08:45 AM"),
                upcoming("Joe Black", "9000", "Mathematics (110)", "101", "8:45 AM-09:30 AM"),
                upcoming("Shivam Verma", "9002", "English (210)", "100", "8:00 AM-08:45 AM"),
                upcoming("Joe Black", "9000", "Mathematics (110)", "101", "8:45 AM-09:30 AM"),
                upcoming("Shivam Verma", "9002", "English (210)", "100", "8:00 AM-08:45 AM")
        );
    }

    private Map<String, Object> upcoming(String teacher, String staffId, String subject, String room, String time) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("teacher", teacher);
        item.put("staffId", staffId);
        item.put("subject", subject);
        item.put("room", room);
        item.put("time", time);
        item.put("photoUrl", "https://ui-avatars.com/api/?name=" + teacher.replace(" ", "+") + "&background=cbd5e0&color=334155&size=64");
        return item;
    }

    private List<Map<String, Object>> demoHomework() {
        return List.of(
                homework("Social Studies (212)", "08/19/2026", "08/24/2026"),
                homework("Science (111)", "08/19/2026", "08/24/2026")
        );
    }

    private Map<String, Object> homework(String subject, String homeworkDate, String submissionDate) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("subject", subject);
        item.put("homeworkDate", homeworkDate);
        item.put("submissionDate", submissionDate);
        item.put("status", "Pending");
        return item;
    }

    private List<Map<String, Object>> demoTeachers() {
        return List.of(
                teacher("Shivam Verma", "9002", true),
                teacher("Joe Black", "9000", true),
                teacher("Shivam Verma", "9002", false),
                teacher("Joe Black", "9000", false),
                teacher("Shivam Verma", "9002", false)
        );
    }

    private Map<String, Object> teacher(String name, String staffId, boolean classTeacher) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("staffId", staffId);
        item.put("classTeacher", classTeacher);
        item.put("photoUrl", "https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=cbd5e0&color=334155&size=64");
        return item;
    }

    private List<Map<String, Object>> demoVisitors() {
        return List.of(
                visitor("Aman", "Marketing", "08/01/2026"),
                visitor("Aman", "Marketing", "08/01/2026"),
                visitor("Aman", "Marketing", "08/01/2026"),
                visitor("Aman", "Marketing", "08/01/2026"),
                visitor("Aman", "Marketing", "08/01/2026")
        );
    }

    private Map<String, Object> visitor(String name, String purpose, String date) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("purpose", purpose);
        item.put("date", date);
        return item;
    }

    private List<Map<String, Object>> demoLibraryIssues() {
        return List.of(
                library("4048", "Physical and Chemical Changes", "08/19/2026", "08/26/2026"),
                library("4049", "Building With Bricks", "08/19/2026", "08/26/2026")
        );
    }

    private Map<String, Object> library(String bookNo, String title, String issueDate, String dueDate) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("bookNo", bookNo);
        item.put("title", title);
        item.put("issueDate", issueDate);
        item.put("dueDate", dueDate);
        return item;
    }
}
