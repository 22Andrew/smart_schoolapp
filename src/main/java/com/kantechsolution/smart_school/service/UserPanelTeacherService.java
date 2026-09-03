package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ClassTeacherAssignment;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StaffTeacherRating;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.ClassTeacherAssignmentRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StaffTeacherRatingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UserPanelTeacherService {

    private static final DateTimeFormatter US_TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.US);

    private final UserPanelContextService contextService;
    private final UserPanelTimetableService timetableService;
    private final StaffMemberRepository staffMemberRepository;
    private final ClassTeacherAssignmentRepository classTeacherAssignmentRepository;
    private final StaffTeacherRatingRepository ratingRepository;

    public UserPanelTeacherService(UserPanelContextService contextService,
                                   UserPanelTimetableService timetableService,
                                   StaffMemberRepository staffMemberRepository,
                                   ClassTeacherAssignmentRepository classTeacherAssignmentRepository,
                                   StaffTeacherRatingRepository ratingRepository) {
        this.contextService = contextService;
        this.timetableService = timetableService;
        this.staffMemberRepository = staffMemberRepository;
        this.classTeacherAssignmentRepository = classTeacherAssignmentRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listTeachers(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String admissionNo = resolveAdmissionNo(student);
        Map<Long, StaffTeacherRating> ratingsByStaff = loadStudentRatings(admissionNo);
        String classTeacherCode = resolveClassTeacherCode(student);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> periods = (List<Map<String, Object>>) timetableService
                .getTimetable(authentication)
                .get("periods");

        List<Map<String, Object>> rows = buildTeacherRowsFromPeriods(
                periods != null ? periods : List.of(), classTeacherCode, ratingsByStaff);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> saveRating(Authentication authentication, Map<String, Object> payload) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }

        String staffIdCode = text(payload.get("staffIdCode"));
        if (staffIdCode.isBlank()) {
            throw new IllegalArgumentException("Teacher is required");
        }

        int rating = parseRating(payload.get("rating"));
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        String comment = text(payload.get("comment"));
        if (comment.isBlank()) {
            throw new IllegalArgumentException("Comment is required");
        }

        StaffMember staff = staffMemberRepository.findByStaffId(staffIdCode)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        String admissionNo = resolveAdmissionNo(student);
        String studentName = resolveStudentName(student);

        StaffTeacherRating entity = ratingRepository
                .findByStaffMemberIdAndStudentAdmissionNo(staff.getId(), admissionNo)
                .orElseGet(StaffTeacherRating::new);

        entity.setStaffMemberId(staff.getId());
        entity.setStaffIdCode(staff.getStaffId());
        entity.setStaffName(fullName(staff));
        entity.setRating(rating);
        entity.setComment(comment);
        entity.setStatus("Pending");
        entity.setStudentName(studentName);
        entity.setStudentAdmissionNo(admissionNo);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        StaffTeacherRating saved = ratingRepository.save(entity);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Rating saved successfully");
        response.put("rating", toRatingFields(saved));
        return response;
    }

    private List<Map<String, Object>> buildTeacherRowsFromPeriods(List<Map<String, Object>> periods,
                                                                  String classTeacherCode,
                                                                  Map<Long, StaffTeacherRating> ratingsByStaff) {
        Map<String, TeacherAccumulator> grouped = new LinkedHashMap<>();
        for (Map<String, Object> period : periods) {
            String teacherId = text(period.get("teacherId"));
            if (teacherId.isBlank()) {
                continue;
            }
            TeacherAccumulator acc = grouped.computeIfAbsent(teacherId, key -> {
                TeacherAccumulator created = new TeacherAccumulator();
                created.teacherId = key;
                created.teacherName = text(period.get("teacherName"));
                return created;
            });
            acc.subjectLabels.add(formatSubjectLabel(period));
            acc.timeLines.add(formatTimeLine(period));
            acc.roomLines.add(text(period.get("roomNo")));
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (TeacherAccumulator acc : grouped.values()) {
            rows.add(toTeacherRow(acc, classTeacherCode, ratingsByStaff));
        }
        return rows;
    }

    private Map<String, Object> toTeacherRow(TeacherAccumulator acc, String classTeacherCode,
                                             Map<Long, StaffTeacherRating> ratingsByStaff) {
        StaffMember staff = staffMemberRepository.findByStaffId(acc.teacherId).orElse(null);
        String teacherName = acc.teacherName;
        if (teacherName.isBlank() && staff != null) {
            teacherName = fullName(staff);
        }

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("staffMemberId", staff != null ? staff.getId() : null);
        row.put("staffIdCode", acc.teacherId);
        row.put("teacherName", teacherName);
        row.put("teacherDisplay", teacherName + " (" + acc.teacherId + ")");
        row.put("classTeacher", acc.teacherId.equalsIgnoreCase(classTeacherCode));
        row.put("subjectLines", new ArrayList<>(dedupePreserveOrder(acc.subjectLabels)));
        row.put("timeLines", new ArrayList<>(acc.timeLines));
        row.put("roomLines", new ArrayList<>(acc.roomLines));
        row.put("email", staff != null ? text(staff.getEmail()) : "");
        row.put("phone", staff != null ? text(staff.getPhone()) : "");
        applyRatingFields(row, staff, ratingsByStaff);
        return row;
    }

    private String resolveClassTeacherCode(StudentAdmission student) {
        if (student == null || student.getSchoolClass() == null) {
            return "";
        }
        String section = student.getSection() != null && !student.getSection().isBlank()
                ? student.getSection().trim()
                : "A";
        Optional<ClassTeacherAssignment> assignment = classTeacherAssignmentRepository
                .findBySchoolClassIdAndSectionIgnoreCase(student.getSchoolClass().getId(), section);
        return assignment.map(ClassTeacherAssignment::getTeacherCode).orElse("");
    }

    private void applyRatingFields(Map<String, Object> row, StaffMember staff,
                                   Map<Long, StaffTeacherRating> ratingsByStaff) {
        StaffTeacherRating rating = staff != null ? ratingsByStaff.get(staff.getId()) : null;
        if (rating != null) {
            row.put("hasRating", true);
            row.put("ratingId", rating.getId());
            row.put("myRating", rating.getRating());
            row.put("comment", rating.getComment() != null ? rating.getComment() : "");
        } else {
            row.put("hasRating", false);
            row.put("ratingId", null);
            row.put("myRating", null);
            row.put("comment", "");
        }
    }

    private Map<String, Object> toRatingFields(StaffTeacherRating rating) {
        Map<String, Object> fields = new LinkedHashMap<>();
        fields.put("ratingId", rating.getId());
        fields.put("staffIdCode", rating.getStaffIdCode());
        fields.put("myRating", rating.getRating());
        fields.put("comment", rating.getComment());
        fields.put("hasRating", true);
        return fields;
    }

    private Map<Long, StaffTeacherRating> loadStudentRatings(String admissionNo) {
        Map<Long, StaffTeacherRating> ratings = new LinkedHashMap<>();
        if (admissionNo.isBlank()) {
            return ratings;
        }
        for (StaffTeacherRating rating : ratingRepository.findByStudentAdmissionNoOrderByIdDesc(admissionNo)) {
            if (Boolean.FALSE.equals(rating.getIsActive())) {
                continue;
            }
            ratings.putIfAbsent(rating.getStaffMemberId(), rating);
        }
        return ratings;
    }

    private String formatSubjectLabel(Map<String, Object> period) {
        String subjectName = text(period.get("subjectName"));
        String subjectCode = text(period.get("subjectCode"));
        String suffix = subjectName.equalsIgnoreCase("Science") ? "practical" : "theory";
        if (subjectCode.isBlank()) {
            return subjectName + " " + suffix;
        }
        return subjectName + " " + suffix + " (" + subjectCode + ")";
    }

    private String formatTimeLine(Map<String, Object> period) {
        String day = text(period.get("dayOfWeek"));
        String from = formatDisplayTime(text(period.get("timeFrom")));
        String to = formatDisplayTime(text(period.get("timeTo")));
        return day + " (" + from + " To " + to + ")";
    }

    private String formatDisplayTime(String raw) {
        if (raw.isBlank()) {
            return raw;
        }
        try {
            LocalTime time = LocalTime.parse(raw, DateTimeFormatter.ofPattern("HH:mm"));
            return US_TIME.format(time);
        } catch (DateTimeParseException ex) {
            try {
                LocalTime time = LocalTime.parse(raw, DateTimeFormatter.ofPattern("H:mm"));
                return US_TIME.format(time);
            } catch (DateTimeParseException ignored) {
                return raw;
            }
        }
    }

    private List<String> dedupePreserveOrder(List<String> values) {
        Set<String> seen = new LinkedHashSet<>();
        List<String> result = new ArrayList<>();
        for (String value : values) {
            if (seen.add(value)) {
                result.add(value);
            }
        }
        return result;
    }

    private int parseRating(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(text(value));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private String resolveAdmissionNo(StudentAdmission student) {
        if (student == null || student.getAdmissionNo() == null) {
            return "";
        }
        return student.getAdmissionNo().trim();
    }

    private String resolveStudentName(StudentAdmission student) {
        if (student == null) {
            return "Student";
        }
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        String name = (first + " " + last).trim();
        return name.isBlank() ? "Student" : name;
    }

    private String fullName(StaffMember staff) {
        String first = staff.getFirstName() != null ? staff.getFirstName().trim() : "";
        String last = staff.getLastName() != null ? staff.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static class TeacherAccumulator {
        private String teacherId = "";
        private String teacherName = "";
        private boolean classTeacher;
        private List<String> subjectLabels = new ArrayList<>();
        private List<String> timeLines = new ArrayList<>();
        private List<String> roomLines = new ArrayList<>();
        private String email = "";
        private String phone = "";
    }
}
