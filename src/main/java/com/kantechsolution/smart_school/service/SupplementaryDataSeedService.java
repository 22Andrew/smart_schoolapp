package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

/**
 * Fills tables that the SQL backup leaves empty and that are not covered by lazy UI seeders.
 * Runs after all other ApplicationRunners (@Order 100).
 */
@Service
@RequiredArgsConstructor
@Order(100)
public class SupplementaryDataSeedService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SupplementaryDataSeedService.class);
    private static final String[] WEEKDAYS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};

    private final JdbcTemplate jdbcTemplate;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final ClassTimetableRepository classTimetableRepository;
    private final TransportStudentFeeRepository transportStudentFeeRepository;
    private final StudentCvProfileRepository studentCvProfileRepository;
    private final StudentCvEducationRepository studentCvEducationRepository;
    private final StudentCvSkillRepository studentCvSkillRepository;
    private final StudentCvWorkExperienceRepository studentCvWorkExperienceRepository;
    private final StudentCvReferenceRepository studentCvReferenceRepository;
    private final DailyAssignmentRepository dailyAssignmentRepository;
    private final OnlineExamRepository onlineExamRepository;
    private final OnlineExamStudentRepository onlineExamStudentRepository;
    private final ContentShareLogRepository contentShareLogRepository;
    private final DownloadContentRepository downloadContentRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StudentTimelineProfileSeedService studentTimelineProfileSeedService;
    private final StudentBehaviourProfileSeedService studentBehaviourProfileSeedService;
    private final StudentCourseProgressSeedService studentCourseProgressSeedService;
    private final BehaviourStudentIncidentRepository behaviourStudentIncidentRepository;
    private final BehaviourStudentIncidentCommentRepository behaviourStudentIncidentCommentRepository;
    private final OnlineExamAttemptRepository onlineExamAttemptRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAcademicYears();
        seedAnnouncements();
        seedClassTimetables();
        seedTransportStudentFees();
        seedStudentCvData();
        seedDailyAssignments();
        seedOnlineExamStudents();
        seedContentShareLogs();
        seedStudentProfileData();
        seedBehaviourIncidentComments();
        seedOnlineExamAttempts();
        log.info("Supplementary data seeding completed.");
    }

    private void seedStudentProfileData() {
        for (StudentAdmission student : studentAdmissionRepository.findAll()) {
            studentTimelineProfileSeedService.seedIfEmpty(student.getId());
            studentBehaviourProfileSeedService.seedIfEmpty(student.getId());
            studentCourseProgressSeedService.seedIfEmpty(student.getId());
        }
    }

    private void seedBehaviourIncidentComments() {
        if (behaviourStudentIncidentCommentRepository.count() > 0) {
            return;
        }
        List<BehaviourStudentIncident> incidents = behaviourStudentIncidentRepository.findAll();
        if (incidents.isEmpty()) {
            return;
        }
        BehaviourStudentIncident incident = incidents.get(0);
        BehaviourStudentIncidentComment comment = BehaviourStudentIncidentComment.builder()
                .incidentRecordId(incident.getId())
                .studentAdmissionId(incident.getStudentAdmissionId())
                .commentText("Acknowledged. Will follow school behaviour guidelines going forward.")
                .authorName("Student")
                .build();
        comment.setIsActive(true);
        behaviourStudentIncidentCommentRepository.save(comment);
    }

    private void seedOnlineExamAttempts() {
        if (onlineExamAttemptRepository.count() > 0) {
            return;
        }
        List<OnlineExam> exams = onlineExamRepository.findAll();
        List<StudentAdmission> students = studentAdmissionRepository.findAll();
        if (exams.isEmpty() || students.isEmpty()) {
            return;
        }
        OnlineExam exam = exams.get(0);
        StudentAdmission student = students.get(0);
        LocalDateTime started = LocalDateTime.now().minusHours(2);
        OnlineExamAttempt attempt = OnlineExamAttempt.builder()
                .onlineExamId(exam.getId())
                .studentAdmissionId(student.getId())
                .attemptNumber(1)
                .startedAt(started)
                .submittedAt(started.plusMinutes(45))
                .submitted(true)
                .remainingSeconds(0)
                .answersJson("{}")
                .build();
        attempt.setIsActive(true);
        onlineExamAttemptRepository.save(attempt);
    }

    private void seedAcademicYears() {
        if (count("academic_years") > 0) {
            return;
        }
        jdbcTemplate.update(
                "INSERT INTO academic_years (created_at, is_active, updated_at, description, end_date, is_current, start_date, year) "
                        + "VALUES (?, 1, ?, ?, ?, 1, ?, ?)",
                LocalDateTime.now(),
                LocalDateTime.now(),
                "Primary and secondary academic session",
                LocalDate.of(2026, 3, 31),
                LocalDate.of(2025, 4, 1),
                "2025-26"
        );
    }

    private void seedAnnouncements() {
        if (count("announcements") > 0) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        jdbcTemplate.update(
                "INSERT INTO announcements (created_at, is_active, updated_at, announcement_type, attachment_url, content, "
                        + "created_by, expiry_date, is_published, priority, publish_date, target_audience, title) "
                        + "VALUES (?, 1, ?, ?, NULL, ?, NULL, ?, 1, ?, ?, ?, ?)",
                now, now, "GENERAL",
                "Welcome to the new academic session. Please review the updated school calendar and fee schedule.",
                now.plusMonths(3), "NORMAL", now, "ALL", "Welcome – New Academic Session"
        );
        jdbcTemplate.update(
                "INSERT INTO announcements (created_at, is_active, updated_at, announcement_type, attachment_url, content, "
                        + "created_by, expiry_date, is_published, priority, publish_date, target_audience, title) "
                        + "VALUES (?, 1, ?, ?, NULL, ?, NULL, ?, 1, ?, ?, ?, ?)",
                now, now, "EXAMINATION",
                "Mid-term examinations begin next month. Students should collect their admit cards from the class teacher.",
                now.plusMonths(2), "HIGH", now, "STUDENTS", "Mid-Term Examination Schedule"
        );
    }

    private void seedClassTimetables() {
        if (classTimetableRepository.count() > 0) {
            return;
        }
        SchoolClass schoolClass = schoolClassRepository.findAll().stream().findFirst().orElse(null);
        Subject subject = subjectRepository.findAll().stream().findFirst().orElse(null);
        if (schoolClass == null || subject == null) {
            return;
        }
        SubjectGroup subjectGroup = subjectGroupRepository.findAll().stream()
                .filter(group -> group.getSchoolClass() != null
                        && group.getSchoolClass().getId().equals(schoolClass.getId()))
                .findFirst()
                .orElse(null);

        String section = schoolClass.getSections().isEmpty() ? "A" : schoolClass.getSections().get(0);
        String teacherName = staffMemberRepository.findAll().stream()
                .filter(staff -> staff.getRoles() != null && staff.getRoles().toLowerCase(Locale.ROOT).contains("teacher"))
                .map(staff -> staff.getFirstName() + " " + staff.getLastName())
                .findFirst()
                .orElse("Staff Teacher");
        String teacherCode = staffMemberRepository.findAll().stream()
                .map(StaffMember::getStaffId)
                .findFirst()
                .orElse("9002");

        LocalTime start = LocalTime.of(8, 0);
        for (int dayIndex = 0; dayIndex < WEEKDAYS.length; dayIndex++) {
            for (int period = 1; period <= 4; period++) {
                ClassTimetable entry = new ClassTimetable();
                entry.setSchoolClass(schoolClass);
                entry.setSection(section);
                entry.setSubjectGroup(subjectGroup);
                entry.setSubject(subject);
                entry.setDayOfWeek(WEEKDAYS[dayIndex]);
                entry.setStartTime(start.plusHours(period - 1L));
                entry.setEndTime(start.plusHours(period).minusMinutes(10));
                entry.setTeacherName(teacherName);
                entry.setTeacherCode(teacherCode);
                entry.setRoomNumber("R-" + (100 + period));
                entry.setPeriodNumber(period);
                classTimetableRepository.save(entry);
            }
        }
    }

    private void seedTransportStudentFees() {
        if (transportStudentFeeRepository.count() > 0) {
            return;
        }
        List<StudentAdmission> students = studentAdmissionRepository.findAll();
        if (students.isEmpty()) {
            return;
        }
        LocalDate dueDate = LocalDate.now().plusDays(15);
        for (StudentAdmission student : students) {
            transportStudentFeeRepository.save(TransportStudentFee.builder()
                    .student(student)
                    .monthName("April")
                    .amount(new BigDecimal("500.00"))
                    .dueDate(dueDate)
                    .build());
        }
    }

    private void seedStudentCvData() {
        for (StudentAdmission student : studentAdmissionRepository.findAll()) {
            if (studentCvProfileRepository.findByStudent_Id(student.getId()).isPresent()) {
                continue;
            }
            StudentCvProfile profile = StudentCvProfile.builder()
                    .student(student)
                    .designation("Student")
                    .about("Academic profile for " + student.getFirstName() + " " + student.getLastName())
                    .build();
            profile.setIsActive(true);
            studentCvProfileRepository.save(profile);

            StudentCvEducation education = StudentCvEducation.builder()
                    .student(student)
                    .qualification("Primary Education")
                    .schoolName("Smart School")
                    .year(String.valueOf(LocalDate.now().getYear()))
                    .marks("Pass")
                    .sortOrder(1)
                    .build();
            education.setIsActive(true);
            studentCvEducationRepository.save(education);

            StudentCvSkill skill = StudentCvSkill.builder()
                    .student(student)
                    .skillCategory("Academic")
                    .details("Mathematics, English, Science")
                    .sortOrder(1)
                    .build();
            skill.setIsActive(true);
            studentCvSkillRepository.save(skill);

            StudentCvWorkExperience work = StudentCvWorkExperience.builder()
                    .student(student)
                    .institution("School Club")
                    .designation("Member")
                    .years(String.valueOf(LocalDate.now().getYear()))
                    .sortOrder(1)
                    .build();
            work.setIsActive(true);
            studentCvWorkExperienceRepository.save(work);

            StudentCvReference reference = StudentCvReference.builder()
                    .student(student)
                    .name("Class Teacher")
                    .relation("Teacher")
                    .contact("school@example.com")
                    .sortOrder(1)
                    .build();
            reference.setIsActive(true);
            studentCvReferenceRepository.save(reference);
        }
    }

    private void seedDailyAssignments() {
        if (dailyAssignmentRepository.count() > 0) {
            return;
        }
        for (StudentAdmission student : studentAdmissionRepository.findAll()) {
            SchoolClass schoolClass = student.getSchoolClass();
            DailyAssignment assignment = DailyAssignment.builder()
                    .studentAdmissionId(student.getId())
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .classId(schoolClass == null ? null : schoolClass.getId())
                    .className(schoolClass == null ? "Class 1" : schoolClass.getName())
                    .section(student.getSection() == null ? "A" : student.getSection())
                    .subjectGroupName("Class Subject Group")
                    .subjectName("English (ENG001)")
                    .title("Reading comprehension – Chapter 1")
                    .assignmentDate(LocalDate.now().minusDays(2))
                    .submissionDate(LocalDate.now())
                    .evaluatedBy("Class Teacher")
                    .build();
            assignment.setIsActive(true);
            dailyAssignmentRepository.save(assignment);
        }
    }

    private void seedOnlineExamStudents() {
        if (onlineExamStudentRepository.count() > 0) {
            return;
        }
        List<OnlineExam> exams = onlineExamRepository.findAll();
        if (exams.isEmpty()) {
            return;
        }
        OnlineExam exam = exams.get(0);
        for (StudentAdmission student : studentAdmissionRepository.findAll()) {
            if (onlineExamStudentRepository.existsByOnlineExamIdAndStudentAdmissionId(exam.getId(), student.getId())) {
                continue;
            }
            OnlineExamStudent row = OnlineExamStudent.builder()
                    .onlineExamId(exam.getId())
                    .studentAdmissionId(student.getId())
                    .build();
            row.setIsActive(true);
            onlineExamStudentRepository.save(row);
        }
    }

    private void seedContentShareLogs() {
        if (contentShareLogRepository.count() > 0) {
            return;
        }
        List<DownloadContent> contents = downloadContentRepository.findAll();
        if (contents.isEmpty()) {
            return;
        }
        DownloadContent content = contents.get(0);
        ContentShareLog logEntry = ContentShareLog.builder()
                .title("Shared study material")
                .shareDate(LocalDate.now())
                .validUntil(LocalDate.now().plusMonths(1))
                .description("Class notes shared with students")
                .sendToType("class")
                .sendToDetails("All enrolled students")
                .recipientRoles("Student")
                .contentIds(String.valueOf(content.getId()))
                .contentTitles(content.getTitle())
                .sharedBy("Admin")
                .build();
        logEntry.setIsActive(true);
        contentShareLogRepository.save(logEntry);
    }

    private int count(String table) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + table + "`", Integer.class);
        return value == null ? 0 : value;
    }
}
