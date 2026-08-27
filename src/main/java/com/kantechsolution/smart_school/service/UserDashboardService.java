package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.LibraryBookIssue;
import com.kantechsolution.smart_school.model.LibraryMember;
import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.Visitor;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.LibraryBookIssueRepository;
import com.kantechsolution.smart_school.repository.LibraryMemberRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.VisitorRepository;
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
    private final UserPanelAttendanceService attendanceService;
    private final UserPanelSyllabusStatusService syllabusStatusService;
    private final UserPanelTimetableService timetableService;
    private final UserPanelTeacherService teacherService;
    private final VisitorRepository visitorRepository;
    private final LibraryMemberRepository libraryMemberRepository;
    private final LibraryBookIssueRepository libraryBookIssueRepository;

    public UserDashboardService(UserPanelContextService contextService,
                                NoticeBoardRepository noticeBoardRepository,
                                HomeworkRepository homeworkRepository,
                                UserPanelAttendanceService attendanceService,
                                UserPanelSyllabusStatusService syllabusStatusService,
                                UserPanelTimetableService timetableService,
                                UserPanelTeacherService teacherService,
                                VisitorRepository visitorRepository,
                                LibraryMemberRepository libraryMemberRepository,
                                LibraryBookIssueRepository libraryBookIssueRepository) {
        this.contextService = contextService;
        this.noticeBoardRepository = noticeBoardRepository;
        this.homeworkRepository = homeworkRepository;
        this.attendanceService = attendanceService;
        this.syllabusStatusService = syllabusStatusService;
        this.timetableService = timetableService;
        this.teacherService = teacherService;
        this.visitorRepository = visitorRepository;
        this.libraryMemberRepository = libraryMemberRepository;
        this.libraryBookIssueRepository = libraryBookIssueRepository;
    }

    @Transactional(readOnly = true)
    public void populateDashboardModel(Model model, Authentication authentication) {
        contextService.populateLayoutModel(model, authentication, "dashboard", "Dashboard");

        StudentAdmission student = contextService.resolveStudent(authentication);
        String studentName = contextService.resolveStudentName(student);

        model.addAttribute("attendancePercent", resolveAttendancePercent(authentication));
        model.addAttribute("minAttendancePercent", "75.00");
        model.addAttribute("notices", resolveNotices());
        model.addAttribute("subjectProgress", resolveSubjectProgress(authentication));
        model.addAttribute("upcomingClasses", resolveUpcomingClasses(authentication));
        model.addAttribute("homeworkItems", resolveHomework(student));
        model.addAttribute("teachers", resolveTeachers(authentication));
        model.addAttribute("visitors", resolveVisitors());
        model.addAttribute("libraryIssues", resolveLibraryIssues(student));
        model.addAttribute("profileImageUrl", contextService.resolveProfileImage(studentName));
    }

    private String resolveAttendancePercent(Authentication authentication) {
        try {
            Map<String, Object> attendance = attendanceService.getProfileAttendance(authentication);
            @SuppressWarnings("unchecked")
            Map<String, Integer> summary = (Map<String, Integer>) attendance.get("summary");
            if (summary == null) {
                return "0.00";
            }
            int present = summary.getOrDefault("present", 0);
            int absent = summary.getOrDefault("absent", 0);
            int late = summary.getOrDefault("late", 0);
            int halfDay = summary.getOrDefault("halfDay", 0);
            int lateExcuse = summary.getOrDefault("lateExcuse", 0);
            int counted = present + absent + late + halfDay + lateExcuse;
            if (counted == 0) {
                return "0.00";
            }
            double percent = present * 100.0 / counted;
            return String.format(Locale.US, "%.2f", percent);
        } catch (Exception ex) {
            return "0.00";
        }
    }

    private List<Map<String, Object>> resolveNotices() {
        List<NoticeBoard> rows = noticeBoardRepository.findAllByOrderByNoticeDateDescCreatedAtDesc();
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

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> resolveSubjectProgress(Authentication authentication) {
        try {
            Map<String, Object> status = syllabusStatusService.getStatus(authentication);
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) status.get("subjects");
            if (subjects == null) {
                return List.of();
            }
            List<Map<String, Object>> items = new ArrayList<>();
            for (Map<String, Object> subject : subjects) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("subject", subject.get("subjectName"));
                item.put("percent", subject.getOrDefault("percent", 0));
                items.add(item);
            }
            return items;
        } catch (Exception ex) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> resolveUpcomingClasses(Authentication authentication) {
        Map<String, Object> timetable = timetableService.getTimetable(authentication);
        List<Map<String, Object>> periods = (List<Map<String, Object>>) timetable.get("periods");
        if (periods == null || periods.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> items = new ArrayList<>();
        int limit = Math.min(periods.size(), 5);
        for (int i = 0; i < limit; i++) {
            Map<String, Object> period = periods.get(i);
            String teacher = text(period.get("teacherName"));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("teacher", teacher);
            item.put("staffId", text(period.get("teacherId")));
            item.put("subject", formatSubjectLine(period));
            item.put("room", text(period.get("roomNo")));
            item.put("time", formatTimeLine(period));
            item.put("photoUrl", avatarUrl(teacher));
            items.add(item);
        }
        return items;
    }

    private List<Map<String, Object>> resolveHomework(StudentAdmission student) {
        List<Homework> rows = homeworkRepository.findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc();
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

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> resolveTeachers(Authentication authentication) {
        Map<String, Object> data = teacherService.listTeachers(authentication);
        List<Map<String, Object>> rows = (List<Map<String, Object>>) data.get("rows");
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> items = new ArrayList<>();
        int limit = Math.min(rows.size(), 5);
        for (int i = 0; i < limit; i++) {
            Map<String, Object> row = rows.get(i);
            String name = text(row.get("teacherName"));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", name);
            item.put("staffId", text(row.get("staffIdCode")));
            item.put("classTeacher", Boolean.TRUE.equals(row.get("classTeacher")));
            item.put("photoUrl", avatarUrl(name));
            items.add(item);
        }
        return items;
    }

    private List<Map<String, Object>> resolveVisitors() {
        List<Visitor> rows = visitorRepository.findAllByOrderByDateDescInTimeDesc();
        List<Map<String, Object>> items = new ArrayList<>();
        int limit = Math.min(rows.size(), 5);
        for (int i = 0; i < limit; i++) {
            Visitor row = rows.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", row.getVisitorName() != null ? row.getVisitorName() : "");
            item.put("purpose", row.getPurpose() != null ? row.getPurpose() : "");
            item.put("date", row.getDate() != null ? row.getDate().format(US_DATE) : "");
            items.add(item);
        }
        return items;
    }

    private List<Map<String, Object>> resolveLibraryIssues(StudentAdmission student) {
        if (student == null || student.getId() == null) {
            return List.of();
        }
        return libraryMemberRepository.findByStudentAdmission_Id(student.getId())
                .map(member -> loadLibraryIssues(member))
                .orElse(List.of());
    }

    private List<Map<String, Object>> loadLibraryIssues(LibraryMember member) {
        List<LibraryBookIssue> issues = libraryBookIssueRepository.findIssuedWithBook(member.getId());
        List<Map<String, Object>> items = new ArrayList<>();
        int limit = Math.min(issues.size(), 5);
        for (int i = 0; i < limit; i++) {
            LibraryBookIssue issue = issues.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("bookNo", issue.getBook() != null ? text(issue.getBook().getBookNumber()) : "");
            item.put("title", issue.getBook() != null ? text(issue.getBook().getTitle()) : "");
            item.put("issueDate", issue.getIssueDate() != null ? issue.getIssueDate().format(US_DATE) : "");
            item.put("dueDate", issue.getDueDate() != null ? issue.getDueDate().format(US_DATE) : "");
            items.add(item);
        }
        return items;
    }

    private String formatSubjectLine(Map<String, Object> period) {
        String subjectName = text(period.get("subjectName"));
        String subjectCode = text(period.get("subjectCode"));
        if (subjectCode.isBlank()) {
            return subjectName;
        }
        return subjectName + " (" + subjectCode + ")";
    }

    private String formatTimeLine(Map<String, Object> period) {
        String from = text(period.get("timeFrom"));
        String to = text(period.get("timeTo"));
        if (from.isBlank() && to.isBlank()) {
            return "";
        }
        return from + "-" + to;
    }

    private String avatarUrl(String name) {
        if (name.isBlank()) {
            return "https://ui-avatars.com/api/?name=Teacher&background=cbd5e0&color=334155&size=64";
        }
        return "https://ui-avatars.com/api/?name=" + name.replace(" ", "+")
                + "&background=cbd5e0&color=334155&size=64";
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
