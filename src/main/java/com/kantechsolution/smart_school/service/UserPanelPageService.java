package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.NoticeBoard;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.TransportRoute;
import com.kantechsolution.smart_school.model.TransportRouteVehicle;
import com.kantechsolution.smart_school.model.TransportVehicle;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentRepository;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.TransportRouteRepository;
import com.kantechsolution.smart_school.repository.TransportRouteVehicleRepository;
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
public class UserPanelPageService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final UserPanelContextService contextService;
    private final HomeworkRepository homeworkRepository;
    private final NoticeBoardRepository noticeBoardRepository;
    private final StudentCvService studentCvService;
    private final BehaviourStudentIncidentRepository behaviourIncidentRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final TransportRouteVehicleRepository transportRouteVehicleRepository;

    public UserPanelPageService(UserPanelContextService contextService,
                                HomeworkRepository homeworkRepository,
                                NoticeBoardRepository noticeBoardRepository,
                                StudentCvService studentCvService,
                                BehaviourStudentIncidentRepository behaviourIncidentRepository,
                                TransportRouteRepository transportRouteRepository,
                                TransportRouteVehicleRepository transportRouteVehicleRepository) {
        this.contextService = contextService;
        this.homeworkRepository = homeworkRepository;
        this.noticeBoardRepository = noticeBoardRepository;
        this.studentCvService = studentCvService;
        this.behaviourIncidentRepository = behaviourIncidentRepository;
        this.transportRouteRepository = transportRouteRepository;
        this.transportRouteVehicleRepository = transportRouteVehicleRepository;
    }

    @Transactional(readOnly = true)
    public void populateTablePage(Model model, Authentication authentication, String activeMenu,
                                    String pageTitle, List<String> headers, List<List<String>> rows) {
        contextService.populateLayoutModel(model, authentication, activeMenu, pageTitle);
        model.addAttribute("tableHeaders", headers);
        model.addAttribute("tableRows", rows);
        model.addAttribute("emptyMessage", "No record found");
    }

    @Transactional(readOnly = true)
    public void populateTablePage(Model model, Authentication authentication, String activeMenu,
                                    String pageTitle, String activeSubmenu,
                                    List<String> headers, List<List<String>> rows) {
        contextService.populateLayoutModel(model, authentication, activeMenu, pageTitle, activeSubmenu);
        model.addAttribute("tableHeaders", headers);
        model.addAttribute("tableRows", rows);
        model.addAttribute("emptyMessage", "No record found");
    }

    @Transactional(readOnly = true)
    public void populateProfile(Model model, Authentication authentication) {
        contextService.populateLayoutModel(model, authentication, "profile", "My Profile");
        StudentAdmission student = contextService.resolveStudent(authentication);
        populateProfileDetails(model, student);
        model.addAttribute("resumeDownloadEnabled", studentCvService.isStudentPanelDownloadEnabled());
        model.addAttribute("profileStudentId", student != null ? student.getId() : null);
    }

    private void populateProfileDetails(Model model, StudentAdmission student) {
        String studentName = contextService.resolveStudentName(student);
        String admissionNo = orDefault(student != null ? student.getAdmissionNo() : null);
        String rollNumber = orDefault(student != null ? student.getRollNumber() : null);
        String className = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getName()
                : "";
        String session = contextService.resolveCurrentSession();
        String section = orDefault(student != null ? student.getSection() : null);
        String gender = orDefault(student != null ? student.getGender() : null);
        String rte = orDefault(student != null ? student.getRte() : null);
        String category = student != null && student.getCategory() != null
                ? student.getCategory().getCategoryName()
                : "";

        model.addAttribute("profileImageUrl", contextService.resolveProfileImage(student));
        model.addAttribute("studentName", studentName);
        model.addAttribute("admissionNo", admissionNo);
        model.addAttribute("rollNumber", rollNumber);
        model.addAttribute("profileClass", className.isBlank() ? "" : className + " (" + session + ")");
        model.addAttribute("profileSection", section);
        model.addAttribute("profileGender", gender);
        model.addAttribute("profileRte", rte.isBlank() ? "No" : rte);
        model.addAttribute("behaviourScore", resolveBehaviourScore(student));
        model.addAttribute("profileActiveTab", "profile");

        model.addAttribute("admissionDate", formatDate(student != null ? student.getAdmissionDate() : null));
        model.addAttribute("dateOfBirth", formatDate(student != null ? student.getDateOfBirth() : null));
        model.addAttribute("profileCategory", category);
        model.addAttribute("mobileNumber", orDefault(student != null ? student.getMobileNumber() : null));
        model.addAttribute("caste", "");
        model.addAttribute("religion", orDefault(student != null ? student.getReligion() : null));
        model.addAttribute("profileEmail", orDefault(student != null ? student.getEmail() : null));
        model.addAttribute("medicalHistory", orDefault(student != null ? student.getMedicalHistory() : null));
        model.addAttribute("profileNote", orDefault(student != null ? student.getNote() : null));

        model.addAttribute("currentAddress", orDefault(student != null ? student.getCurrentAddress() : null));
        model.addAttribute("permanentAddress", orDefault(student != null ? student.getPermanentAddress() : null));

        model.addAttribute("fatherName", orDefault(student != null ? student.getFatherName() : null));
        model.addAttribute("fatherPhone", orDefault(student != null ? student.getFatherPhone() : null));
        model.addAttribute("fatherOccupation", orDefault(student != null ? student.getFatherOccupation() : null));
        model.addAttribute("motherName", orDefault(student != null ? student.getMotherName() : null));
        model.addAttribute("motherPhone", orDefault(student != null ? student.getMotherPhone() : null));
        model.addAttribute("motherOccupation", orDefault(student != null ? student.getMotherOccupation() : null));
        model.addAttribute("guardianName", orDefault(student != null ? student.getGuardianName() : null));
        model.addAttribute("guardianEmail", student != null ? blankToEmpty(student.getGuardianEmail()) : "");
        model.addAttribute("guardianRelation", orDefault(student != null ? student.getGuardianRelation() : null));
        model.addAttribute("guardianPhone", orDefault(student != null ? student.getGuardianPhone() : null));
        model.addAttribute("guardianOccupation", orDefault(student != null ? student.getGuardianOccupation() : null));
        model.addAttribute("guardianAddress", orDefault(student != null ? student.getGuardianAddress() : null));

        model.addAttribute("pickupPoint", orDefault(student != null ? student.getPickupPoint() : null));
        model.addAttribute("transportRoute", orDefault(student != null ? student.getRouteList() : null));
        populateTransportVehicle(model, student);

        if (student != null && student.getHostel() != null) {
            model.addAttribute("hostelName", student.getHostel().getHostelName());
        } else {
            model.addAttribute("hostelName", "");
        }
        if (student != null && student.getHostelRoom() != null) {
            model.addAttribute("hostelRoomNo", orDefault(student.getHostelRoom().getRoomNumber()));
            model.addAttribute("hostelRoomType", student.getHostelRoom().getRoomType() != null
                    ? student.getHostelRoom().getRoomType().getRoomType()
                    : "");
        } else {
            model.addAttribute("hostelRoomNo", "");
            model.addAttribute("hostelRoomType", "");
        }

        model.addAttribute("bloodGroup", orDefault(student != null ? student.getBloodGroup() : null));
        model.addAttribute("houseName", student != null && student.getHouse() != null
                ? student.getHouse().getName()
                : "");
        model.addAttribute("studentHeight", orDefault(student != null ? student.getHeight() : null));
        model.addAttribute("studentWeight", orDefault(student != null ? student.getWeight() : null));
        model.addAttribute("measurementDate", formatDate(student != null ? student.getMeasurementDate() : null));
        model.addAttribute("previousSchoolDetails", orDefault(student != null ? student.getPreviousSchoolDetails() : null));
        model.addAttribute("nationalId", orDefault(student != null ? student.getNationalId() : null));
        model.addAttribute("localId", orDefault(student != null ? student.getLocalId() : null));
        model.addAttribute("bankAccountNumber", orDefault(student != null ? student.getBankAccountNumber() : null));
        model.addAttribute("bankName", orDefault(student != null ? student.getBankName() : null));
        model.addAttribute("ifscCode", orDefault(student != null ? student.getIfscCode() : null));
    }

    private String resolveBehaviourScore(StudentAdmission student) {
        if (student == null || student.getId() == null) {
            return "0";
        }
        int total = behaviourIncidentRepository
                .findByStudentAdmissionIdOrderByIncidentDateDescIdDesc(student.getId())
                .stream()
                .mapToInt(incident -> incident.getPoints() != null ? incident.getPoints() : 0)
                .sum();
        return String.valueOf(total);
    }

    private void populateTransportVehicle(Model model, StudentAdmission student) {
        model.addAttribute("vehicleNumber", "");
        model.addAttribute("driverName", "");
        model.addAttribute("driverContact", "");
        if (student == null || student.getRouteList() == null || student.getRouteList().isBlank()) {
            return;
        }
        transportRouteRepository.findByTitleIgnoreCase(student.getRouteList().trim()).ifPresent(route -> {
            TransportVehicle vehicle = resolveAssignedVehicle(route);
            if (vehicle != null) {
                model.addAttribute("vehicleNumber", orDefault(vehicle.getVehicleNumber()));
                model.addAttribute("driverName", orDefault(vehicle.getDriverName()));
                model.addAttribute("driverContact", orDefault(vehicle.getDriverContact()));
            }
        });
    }

    private TransportVehicle resolveAssignedVehicle(TransportRoute route) {
        List<TransportRouteVehicle> assignments = transportRouteVehicleRepository.findByRoute_IdWithVehicle(route.getId());
        if (assignments.isEmpty()) {
            return null;
        }
        return assignments.get(0).getVehicle();
    }

    private String blankToEmpty(String value) {
        return value == null || value.isBlank() ? "" : value.trim();
    }

    private String formatDate(java.time.LocalDate date) {
        if (date == null) {
            return "";
        }
        return date.format(US_DATE);
    }

    private String orDefault(String value) {
        return value == null || value.isBlank() ? "" : value.trim();
    }

    @Transactional(readOnly = true)
    public void populateGetFees(Model model, Authentication authentication) {
        contextService.populateLayoutModel(model, authentication, "fees", "Student Fees");
        StudentAdmission student = contextService.resolveStudent(authentication);
        String session = contextService.resolveCurrentSession();
        String className = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getName()
                : "";
        String section = orDefault(student != null ? student.getSection() : null);

        model.addAttribute("feeStudentId", student != null ? student.getId() : null);
        model.addAttribute("feeSessionYear", session);
        model.addAttribute("feeFatherName", orDefault(student != null ? student.getFatherName() : null));
        model.addAttribute("feeMobileNumber", orDefault(student != null ? student.getMobileNumber() : null));
        model.addAttribute("feeCategory", student != null && student.getCategory() != null
                ? student.getCategory().getCategoryName()
                : "");
        model.addAttribute("feeClassSection", className.isBlank() ? "" : className + " (" + section + ")");
        model.addAttribute("feeRollNumber", orDefault(student != null ? student.getRollNumber() : null));
        model.addAttribute("feeRte", orDefault(student != null ? student.getRte() : null));
    }

    @Transactional(readOnly = true)
    public void populateFees(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "fees", "Fees",
                List.of("Fees Group", "Fees Code", "Due Date", "Amount", "Paid", "Balance", "Status"),
                demoFeesRows());
    }

    @Transactional(readOnly = true)
    public void populateOnlineCourse(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "online-course", "Online Course",
                List.of("Course Title", "Class", "Section", "Lesson", "Quiz", "Exam", "Assignment", "Price"),
                demoOnlineCourseRows());
    }

    @Transactional(readOnly = true)
    public void populateGmeet(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "gmeet", "Gmeet Live Classes",
                List.of("Class", "Section", "Date", "Time", "Duration", "Meeting ID", "Status"),
                demoLiveClassRows("Gmeet"));
    }

    @Transactional(readOnly = true)
    public void populateZoom(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "zoom", "Zoom Live Classes",
                List.of("Class", "Section", "Date", "Time", "Duration", "Meeting ID", "Status"),
                demoLiveClassRows("Zoom"));
    }

    @Transactional(readOnly = true)
    public void populateTimetable(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "timetable", "Class Timetable",
                List.of("Day", "Subject", "Teacher", "Room No.", "Time From", "Time To"),
                demoTimetableRows());
    }

    @Transactional(readOnly = true)
    public void populateLessonPlan(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "lesson-plan", "Lesson Plan",
                List.of("Subject", "Topic", "Date", "Time From", "Time To", "Lecture YouTube URL"),
                demoLessonPlanRows());
    }

    @Transactional(readOnly = true)
    public void populateSyllabus(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "syllabus", "Syllabus Status",
                List.of("Subject", "Total", "Complete", "Incomplete", "Percentage"),
                demoSyllabusRows());
    }

    @Transactional(readOnly = true)
    public void populateHomework(Model model, Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        List<List<String>> rows = new ArrayList<>();
        List<Homework> items = homeworkRepository.findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc();
        if (!items.isEmpty()) {
            int limit = Math.min(items.size(), 20);
            for (int i = 0; i < limit; i++) {
                Homework hw = items.get(i);
                if (student != null && student.getSchoolClass() != null
                        && hw.getClassId() != null
                        && !hw.getClassId().equals(student.getSchoolClass().getId())) {
                    continue;
                }
                rows.add(List.of(
                        hw.getSubjectName(),
                        hw.getHomeworkDate() != null ? hw.getHomeworkDate().format(US_DATE) : "",
                        hw.getSubmissionDate() != null ? hw.getSubmissionDate().format(US_DATE) : "",
                        hw.getDescription() != null ? truncate(hw.getDescription(), 60) : "",
                        "Pending"
                ));
            }
        }
        if (rows.isEmpty()) {
            rows = demoHomeworkRows();
        }
        populateTablePage(model, authentication, "homework", "Homework",
                List.of("Subject", "Homework Date", "Submission Date", "Description", "Status"),
                rows);
    }

    @Transactional(readOnly = true)
    public void populateOnlineExam(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "online-exam", "Online Exam",
                List.of("Exam", "Quiz", "Attempt", "Duration", "Exam From", "Exam To", "Status"),
                demoOnlineExamRows());
    }

    @Transactional(readOnly = true)
    public void populateApplyLeave(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "apply-leave", "Apply Leave",
                List.of("Apply Date", "Leave From", "Leave To", "Reason", "Status"),
                demoLeaveRows());
        model.addAttribute("showApplyLeaveForm", true);
    }

    @Transactional(readOnly = true)
    public void populateVisitorBook(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "visitor-book", "Visitor Book",
                List.of("Purpose", "Meeting With", "Visitor Name", "Phone", "Date", "In Time", "Out Time"),
                demoVisitorBookRows());
    }

    @Transactional(readOnly = true)
    public void populateDownloadContents(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "download-center", "Download Center - Contents", "contents",
                List.of("Content Title", "Type", "Date", "Available For", "Action"),
                demoDownloadContentRows());
    }

    @Transactional(readOnly = true)
    public void populateDownloadVideo(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "download-center", "Download Center - Video Tutorial", "video",
                List.of("Video Title", "Description", "Class", "Date", "Action"),
                demoDownloadVideoRows());
    }

    @Transactional(readOnly = true)
    public void populateAttendance(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "attendance", "Attendance",
                List.of("Date", "Type", "Remark", "Attendance"),
                demoAttendanceRows());
    }

    @Transactional(readOnly = true)
    public void populateCbseSchedule(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "cbse-exam", "CBSE Examination - Exam Schedule", "cbse-schedule",
                List.of("Exam", "Subject", "Date", "Start Time", "Duration", "Room No."),
                demoExamScheduleRows("CBSE"));
    }

    @Transactional(readOnly = true)
    public void populateCbseResult(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "cbse-exam", "CBSE Examination - Exam Result", "cbse-result",
                List.of("Exam", "Subject", "Max Marks", "Min Marks", "Marks Obtained", "Grade", "Result"),
                demoExamResultRows("CBSE"));
    }

    @Transactional(readOnly = true)
    public void populateExamSchedule(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "examinations", "Examinations - Exam Schedule", "exam-schedule",
                List.of("Exam Group", "Exam", "Subject", "Date", "Start Time", "Duration"),
                demoExamScheduleRows("General"));
    }

    @Transactional(readOnly = true)
    public void populateExamResult(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "examinations", "Examinations - Exam Result", "exam-result",
                List.of("Exam Group", "Exam", "Subject", "Max Marks", "Min Marks", "Marks Obtained", "Result"),
                demoExamResultRows("General"));
    }

    @Transactional(readOnly = true)
    public void populateNoticeBoard(Model model, Authentication authentication) {
        contextService.populateLayoutModel(model, authentication, "notice-board", "Notice Board");
        List<Map<String, Object>> notices = new ArrayList<>();
        List<NoticeBoard> rows = noticeBoardRepository.findAllByOrderByNoticeDateDescCreatedAtDesc();
        if (!rows.isEmpty()) {
            for (NoticeBoard row : rows) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("title", row.getTitle());
                item.put("message", row.getMessage());
                item.put("date", row.getNoticeDate() != null ? row.getNoticeDate().format(US_DATE) : "");
                notices.add(item);
            }
        } else {
            notices = demoNoticeItems();
        }
        model.addAttribute("notices", notices);
    }

    @Transactional(readOnly = true)
    public void populateTeacherReview(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "teacher-review", "Teachers Reviews",
                List.of("Staff ID", "Teacher Name", "Rating", "Description", "Date"),
                demoTeacherReviewRows());
        model.addAttribute("showTeacherReviewForm", true);
    }

    @Transactional(readOnly = true)
    public void populateLibraryBooks(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "library", "Library - Book List", "books",
                List.of("Book No.", "Book Title", "Author", "Publisher", "Available"),
                demoLibraryBookRows());
    }

    @Transactional(readOnly = true)
    public void populateLibraryIssued(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "library", "Library - Book Issued", "issued",
                List.of("Book No.", "Book Title", "Issue Date", "Due Return", "Return Date", "Status"),
                demoLibraryIssuedRows());
    }

    @Transactional(readOnly = true)
    public void populateTransport(Model model, Authentication authentication) {
        populateTablePage(model, authentication, "transport", "Transport Routes",
                List.of("Route Title", "Vehicle No.", "Driver Name", "Driver Contact", "Pickup Point", "Fare"),
                demoTransportRows());
    }

    @Transactional(readOnly = true)
    public void populateHostel(Model model, Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        List<List<String>> rows = new ArrayList<>();
        if (student != null && student.getHostel() != null) {
            rows.add(List.of(
                    student.getHostel().getHostelName(),
                    student.getHostelRoom() != null ? student.getHostelRoom().getRoomNumber() : "-",
                    student.getHostelRoom() != null ? String.valueOf(student.getHostelRoom().getNumberOfBed()) : "-",
                    student.getHostelRoom() != null ? String.valueOf(student.getHostelRoom().getCostPerBed()) : "-"
            ));
        }
        if (rows.isEmpty()) {
            rows = demoHostelRows();
        }
        populateTablePage(model, authentication, "hostel", "Hostel Rooms",
                List.of("Hostel Name", "Room No.", "No. Of Bed", "Cost Per Bed"),
                rows);
    }

    private String truncate(String text, int max) {
        if (text.length() <= max) {
            return text;
        }
        return text.substring(0, max - 3) + "...";
    }

    private List<List<String>> demoFeesRows() {
        return List.of(
                List.of("Class 1 Fees", "101", "08/01/2026", "5000.00", "4500.00", "500.00", "Partial"),
                List.of("Transport Fees", "T01", "08/01/2026", "1200.00", "1200.00", "0.00", "Paid")
        );
    }

    private List<List<String>> demoOnlineCourseRows() {
        return List.of(
                List.of("English Grammar Basics", "Class 1", "A", "12", "4", "2", "3", "Free"),
                List.of("Science Fundamentals", "Class 1", "A", "10", "3", "1", "2", "Free")
        );
    }

    private List<List<String>> demoLiveClassRows(String platform) {
        return List.of(
                List.of("Class 1", "A", "08/25/2026", "09:00 AM", "45 Min", platform + "-123456789", "Upcoming"),
                List.of("Class 1", "A", "08/26/2026", "10:00 AM", "45 Min", platform + "-987654321", "Scheduled")
        );
    }

    private List<List<String>> demoTimetableRows() {
        return List.of(
                List.of("Monday", "English (210)", "Shivam Verma (9002)", "100", "08:00 AM", "08:45 AM"),
                List.of("Monday", "Mathematics (110)", "Joe Black (9000)", "101", "08:45 AM", "09:30 AM"),
                List.of("Tuesday", "Science (111)", "Shivam Verma (9002)", "102", "08:00 AM", "08:45 AM")
        );
    }

    private List<List<String>> demoLessonPlanRows() {
        return List.of(
                List.of("English", "Nouns and Pronouns", "08/20/2026", "08:00 AM", "08:45 AM", "-"),
                List.of("Mathematics", "Addition and Subtraction", "08/21/2026", "08:45 AM", "09:30 AM", "-")
        );
    }

    private List<List<String>> demoSyllabusRows() {
        return List.of(
                List.of("English", "50", "34", "16", "68%"),
                List.of("Hindi", "40", "0", "40", "0%"),
                List.of("Mathematics", "45", "0", "45", "0%"),
                List.of("Science", "30", "30", "0", "100%"),
                List.of("Social Studies", "25", "25", "0", "100%")
        );
    }

    private List<List<String>> demoHomeworkRows() {
        return List.of(
                List.of("Social Studies (212)", "08/19/2026", "08/24/2026", "Complete chapter 3 exercises", "Pending"),
                List.of("Science (111)", "08/19/2026", "08/24/2026", "Prepare lab report", "Pending")
        );
    }

    private List<List<String>> demoOnlineExamRows() {
        return List.of(
                List.of("Unit Test 1", "Quiz 1", "0/1", "60 Min", "08/25/2026", "08/30/2026", "Available"),
                List.of("Mid Term", "Quiz 2", "0/1", "90 Min", "09/01/2026", "09/05/2026", "Upcoming")
        );
    }

    private List<List<String>> demoLeaveRows() {
        return List.of(
                List.of("08/10/2026", "08/12/2026", "08/12/2026", "Medical leave", "Approved"),
                List.of("08/18/2026", "08/19/2026", "08/19/2026", "Family function", "Pending")
        );
    }

    private List<List<String>> demoVisitorBookRows() {
        return List.of(
                List.of("Marketing", "Principal", "Aman", "9876543210", "08/01/2026", "10:00 AM", "10:30 AM"),
                List.of("Admission", "Admin Office", "Ravi Kumar", "9876501234", "08/05/2026", "11:00 AM", "11:45 AM")
        );
    }

    private List<List<String>> demoDownloadContentRows() {
        return List.of(
                List.of("Holiday Homework", "Assignment", "08/01/2026", "Student", "Download"),
                List.of("Syllabus PDF", "Syllabus", "07/15/2026", "Student", "Download")
        );
    }

    private List<List<String>> demoDownloadVideoRows() {
        return List.of(
                List.of("English Grammar Intro", "Introduction to nouns", "Class 1", "07/20/2026", "Watch"),
                List.of("Science Lab Safety", "Safety rules for lab", "Class 1", "07/22/2026", "Watch")
        );
    }

    private List<List<String>> demoAttendanceRows() {
        return List.of(
                List.of("08/01/2026", "Present", "-", "Present"),
                List.of("08/02/2026", "Present", "-", "Present"),
                List.of("08/03/2026", "Absent", "Sick", "Absent"),
                List.of("08/04/2026", "Present", "-", "Present")
        );
    }

    private List<List<String>> demoExamScheduleRows(String type) {
        return List.of(
                List.of(type + " Term 1", "English", "09/10/2026", "09:00 AM", "3 Hours", "100"),
                List.of(type + " Term 1", "Mathematics", "09/12/2026", "09:00 AM", "3 Hours", "101")
        );
    }

    private List<List<String>> demoExamResultRows(String type) {
        if ("General".equals(type)) {
            return List.of(
                    List.of("Mid Term", "Unit Test", "English", "100", "33", "68", "Pass"),
                    List.of("Mid Term", "Unit Test", "Mathematics", "100", "33", "72", "Pass")
            );
        }
        return List.of(
                List.of(type + " Term 1", "English", "100", "33", "68", "B+", "Pass"),
                List.of(type + " Term 1", "Mathematics", "100", "33", "72", "A", "Pass")
        );
    }

    private List<Map<String, Object>> demoNoticeItems() {
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(noticeItem("Notice for new Book collection", "Please collect new books from the library.", "08/18/2026"));
        items.add(noticeItem("Fee Submission Reminder", "Kindly submit pending fees before the due date.", "08/06/2026"));
        items.add(noticeItem("Unit Test Schedule Released", "The unit test schedule has been published.", "08/05/2026"));
        return items;
    }

    private Map<String, Object> noticeItem(String title, String message, String date) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", title);
        item.put("message", message);
        item.put("date", date);
        return item;
    }

    private List<List<String>> demoTeacherReviewRows() {
        return List.of(
                List.of("9002", "Shivam Verma", "4", "Excellent teaching method", "08/10/2026"),
                List.of("9000", "Joe Black", "5", "Very helpful and supportive", "08/12/2026")
        );
    }

    private List<List<String>> demoLibraryBookRows() {
        return List.of(
                List.of("4048", "Physical and Chemical Changes", "NCERT", "NCERT", "Yes"),
                List.of("4049", "Building With Bricks", "NCERT", "NCERT", "Yes")
        );
    }

    private List<List<String>> demoLibraryIssuedRows() {
        return List.of(
                List.of("4048", "Physical and Chemical Changes", "08/19/2026", "08/26/2026", "-", "Issued"),
                List.of("4049", "Building With Bricks", "08/19/2026", "08/26/2026", "-", "Issued")
        );
    }

    private List<List<String>> demoTransportRows() {
        return List.of(
                List.of("Route 1 - City Center", "DL-01-AB-1234", "Rajesh Kumar", "9876543210", "Main Gate", "1200.00"),
                List.of("Route 2 - North Zone", "DL-02-CD-5678", "Suresh Singh", "9876509876", "Sector 5", "1500.00")
        );
    }

    private List<List<String>> demoHostelRows() {
        return List.of(
                List.of("Boys Hostel A", "101", "4", "5000.00")
        );
    }
}
