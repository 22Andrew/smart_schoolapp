package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
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

@Service
public class UserDashboardService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final UserPanelContextService contextService;
    private final NoticeBoardRepository noticeBoardRepository;
    private final HomeworkRepository homeworkRepository;

    public UserDashboardService(UserPanelContextService contextService,
                                NoticeBoardRepository noticeBoardRepository,
                                HomeworkRepository homeworkRepository) {
        this.contextService = contextService;
        this.noticeBoardRepository = noticeBoardRepository;
        this.homeworkRepository = homeworkRepository;
    }

    @Transactional(readOnly = true)
    public void populateDashboardModel(Model model, Authentication authentication) {
        contextService.populateLayoutModel(model, authentication, "dashboard", "Dashboard");

        StudentAdmission student = contextService.resolveStudent(authentication);
        String studentName = contextService.resolveStudentName(student);

        model.addAttribute("attendancePercent", "81.82");
        model.addAttribute("minAttendancePercent", "75.00");
        model.addAttribute("notices", resolveNotices());
        model.addAttribute("subjectProgress", demoSubjectProgress());
        model.addAttribute("upcomingClasses", demoUpcomingClasses());
        model.addAttribute("homeworkItems", resolveHomework(student));
        model.addAttribute("teachers", demoTeachers());
        model.addAttribute("visitors", demoVisitors());
        model.addAttribute("libraryIssues", demoLibraryIssues());
        model.addAttribute("profileImageUrl", contextService.resolveProfileImage(studentName));
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
