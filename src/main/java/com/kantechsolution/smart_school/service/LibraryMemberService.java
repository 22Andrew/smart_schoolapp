package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Library;
import com.kantechsolution.smart_school.model.LibraryBookIssue;
import com.kantechsolution.smart_school.model.LibraryMember;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.LibraryBookIssueRepository;
import com.kantechsolution.smart_school.repository.LibraryMemberRepository;
import com.kantechsolution.smart_school.repository.LibraryRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LibraryMemberService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter US = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final LibraryMemberRepository memberRepository;
    private final LibraryBookIssueRepository issueRepository;
    private final LibraryRepository libraryRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;

    public LibraryMemberService(
            LibraryMemberRepository memberRepository,
            LibraryBookIssueRepository issueRepository,
            LibraryRepository libraryRepository,
            StudentAdmissionRepository studentAdmissionRepository,
            StaffMemberRepository staffMemberRepository
    ) {
        this.memberRepository = memberRepository;
        this.issueRepository = issueRepository;
        this.libraryRepository = libraryRepository;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.staffMemberRepository = staffMemberRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMembers() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (LibraryMember member : memberRepository.findActiveWithDetails()) {
            StudentAdmission student = member.getStudentAdmission();
            if (student != null && student.isDisabled()) {
                continue;
            }
            StaffMember staff = member.getStaffMember();
            if (staff != null && Boolean.TRUE.equals(staff.getDisabled())) {
                continue;
            }
            rows.add(toMemberListMap(member));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMember(Long id) {
        LibraryMember member = memberRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        if (!Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("Member not found");
        }
        return toMemberDetailMap(member);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudentMembers(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId,
                blankToNull(section),
                null,
                false,
                null
        );
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            rows.add(toStudentMemberMap(student));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> addStudentMember(Long studentId) {
        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (student.isDisabled()) {
            throw new IllegalArgumentException("Disabled students cannot be added as members");
        }

        LibraryMember member = memberRepository.findByStudentAdmission_Id(studentId).orElse(null);
        if (member != null && Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("This student is already a library member");
        }
        if (member == null) {
            member = LibraryMember.builder()
                    .memberType("Student")
                    .studentAdmission(student)
                    .libraryCardNo(temporaryCardNo(student.getId()))
                    .build();
            member.setIsActive(true);
            member = memberRepository.save(member);
            member.setLibraryCardNo(formatCardNo(member.getId()));
        }
        member.setIsActive(true);
        member.setMemberType("Student");
        member.setStudentAdmission(student);
        return toStudentMemberMap(memberRepository.save(member));
    }

    @Transactional
    public Map<String, Object> surrenderStudentMember(Long studentId) {
        LibraryMember member = memberRepository.findByStudentAdmission_Id(studentId)
                .orElseThrow(() -> new IllegalArgumentException("This student is not a library member"));
        if (!Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("This student is not a library member");
        }
        member.setIsActive(false);
        memberRepository.save(member);
        return toStudentMemberMap(member);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStaffMembers(String keyword) {
        List<StaffMember> staffList = staffMemberRepository.search(null, blankToNull(keyword));
        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember staff : staffList) {
            rows.add(toStaffMemberMap(staff));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> addStaffMember(Long staffMemberId) {
        StaffMember staff = staffMemberRepository.findById(staffMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        if (Boolean.TRUE.equals(staff.getDisabled())) {
            throw new IllegalArgumentException("Disabled staff cannot be added as members");
        }

        LibraryMember member = memberRepository.findByStaffMember_Id(staffMemberId).orElse(null);
        if (member != null && Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("This staff member is already a library member");
        }
        if (member == null) {
            member = LibraryMember.builder()
                    .memberType("Teacher")
                    .staffMember(staff)
                    .libraryCardNo(temporaryCardNo(staff.getId()))
                    .build();
            member.setIsActive(true);
            member = memberRepository.save(member);
            member.setLibraryCardNo(formatCardNo(member.getId()));
        }
        member.setIsActive(true);
        member.setMemberType("Teacher");
        member.setStaffMember(staff);
        return toStaffMemberMap(memberRepository.save(member));
    }

    @Transactional
    public Map<String, Object> surrenderStaffMember(Long staffMemberId) {
        LibraryMember member = memberRepository.findByStaffMember_Id(staffMemberId)
                .orElseThrow(() -> new IllegalArgumentException("This staff member is not a library member"));
        if (!Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("This staff member is not a library member");
        }
        member.setIsActive(false);
        memberRepository.save(member);
        return toStaffMemberMap(member);
    }

    public List<Map<String, Object>> listAvailableBooks() {
        List<Map<String, Object>> books = new ArrayList<>();
        for (Library book : libraryRepository.findAllByOrderByIdDesc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", book.getId());
            row.put("title", book.getTitle());
            row.put("bookNumber", book.getBookNumber());
            row.put("available", book.getAvailableCopies());
            books.add(row);
        }
        return books;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listIssues(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new IllegalArgumentException("Member not found");
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (LibraryBookIssue issue : issueRepository.findIssuedWithBook(memberId)) {
            rows.add(toIssueMap(issue));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> issueBook(Long memberId, Map<String, Object> payload) {
        LibraryMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        if (!Boolean.TRUE.equals(member.getIsActive())) {
            throw new IllegalArgumentException("This member is not an active library member");
        }

        Long bookId = parseLong(payload.get("bookId"), "Books");
        if (bookId == null) {
            throw new IllegalArgumentException("Books is required");
        }
        Library book = libraryRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getAvailableCopies() != null && book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("This book is not available");
        }

        LocalDate dueDate = parseDate(payload.get("dueDate"), true);
        if (dueDate == null) {
            throw new IllegalArgumentException("Due Return Date is required");
        }

        LibraryBookIssue issue = LibraryBookIssue.builder()
                .book(book)
                .member(member)
                .issueDate(LocalDate.now())
                .dueDate(dueDate)
                .build();
        issue.setIsActive(true);
        issue = issueRepository.save(issue);

        if (book.getAvailableCopies() != null) {
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() - 1));
            libraryRepository.save(book);
        }

        return toIssueMap(issue);
    }

    @Transactional
    public Map<String, Object> returnBook(Long issueId) {
        LibraryBookIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issued book not found"));
        if (issue.getReturnDate() != null) {
            throw new IllegalArgumentException("This book has already been returned");
        }

        issue.setReturnDate(LocalDate.now());
        issueRepository.save(issue);

        Library book = issue.getBook();
        if (book != null && book.getAvailableCopies() != null) {
            int total = book.getTotalCopies() == null ? Integer.MAX_VALUE : book.getTotalCopies();
            book.setAvailableCopies(Math.min(total, book.getAvailableCopies() + 1));
            libraryRepository.save(book);
        }

        return toIssueMap(issue);
    }

    private Map<String, Object> toStudentMemberMap(StudentAdmission student) {
        LibraryMember member = memberRepository.findByStudentAdmission_Id(student.getId()).orElse(null);
        boolean isMember = member != null && Boolean.TRUE.equals(member.getIsActive());
        String className = student.getSchoolClass() == null ? "" : nullToEmpty(student.getSchoolClass().getName());
        String section = nullToEmpty(student.getSection());
        String classLabel = className;
        if (!className.isEmpty() && !section.isEmpty()) {
            classLabel = className + "(" + section + ")";
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("studentId", student.getId());
        map.put("isMember", isMember);
        map.put("memberId", isMember ? member.getId() : null);
        map.put("libraryCardNo", isMember ? member.getLibraryCardNo() : "");
        map.put("admissionNo", nullToEmpty(student.getAdmissionNo()));
        map.put("studentName", fullName(student));
        map.put("className", classLabel);
        map.put("fatherName", nullToEmpty(student.getFatherName()));
        map.put("dateOfBirth", formatUs(student.getDateOfBirth()));
        map.put("gender", nullToEmpty(student.getGender()));
        map.put("mobileNumber", nullToEmpty(student.getMobileNumber()));
        return map;
    }

    private Map<String, Object> toStudentMemberMap(LibraryMember member) {
        StudentAdmission student = member.getStudentAdmission();
        if (student == null) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("studentId", null);
            map.put("isMember", Boolean.TRUE.equals(member.getIsActive()));
            map.put("memberId", member.getId());
            map.put("libraryCardNo", member.getLibraryCardNo());
            return map;
        }
        return toStudentMemberMap(student);
    }

    private Map<String, Object> toStaffMemberMap(StaffMember staff) {
        LibraryMember member = memberRepository.findByStaffMember_Id(staff.getId()).orElse(null);
        boolean isMember = member != null && Boolean.TRUE.equals(member.getIsActive());
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("staffMemberId", staff.getId());
        map.put("isMember", isMember);
        map.put("memberId", isMember ? member.getId() : null);
        map.put("libraryCardNo", isMember ? member.getLibraryCardNo() : "");
        map.put("staffId", nullToEmpty(staff.getStaffId()));
        map.put("name", staffFullName(staff));
        map.put("email", nullToEmpty(staff.getEmail()));
        map.put("dateOfBirth", formatUs(staff.getDateOfBirth()));
        map.put("phone", nullToEmpty(staff.getPhone()));
        return map;
    }

    private Map<String, Object> toStaffMemberMap(LibraryMember member) {
        StaffMember staff = member.getStaffMember();
        if (staff == null) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("staffMemberId", null);
            map.put("isMember", Boolean.TRUE.equals(member.getIsActive()));
            map.put("memberId", member.getId());
            map.put("libraryCardNo", member.getLibraryCardNo());
            return map;
        }
        return toStaffMemberMap(staff);
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String temporaryCardNo(Long studentId) {
        return "TMP-" + studentId + "-" + System.nanoTime();
    }

    private String formatCardNo(Long memberId) {
        return String.format("%02dL%d", memberId % 100, memberId);
    }

    private Map<String, Object> toMemberListMap(LibraryMember member) {
        StudentAdmission student = member.getStudentAdmission();
        StaffMember staff = member.getStaffMember();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", member.getId());
        map.put("libraryCardNo", member.getLibraryCardNo());
        if (staff != null) {
            map.put("admissionNo", nullToEmpty(staff.getStaffId()));
            map.put("name", staffFullName(staff));
            map.put("memberType", nullToEmpty(member.getMemberType()).isEmpty() ? "Teacher" : member.getMemberType());
            map.put("phone", nullToEmpty(staff.getPhone()));
        } else {
            map.put("admissionNo", student == null ? "" : nullToEmpty(student.getAdmissionNo()));
            map.put("name", student == null ? "" : fullName(student));
            map.put("memberType", member.getMemberType());
            map.put("phone", student == null ? "" : nullToEmpty(student.getMobileNumber()));
        }
        return map;
    }

    private Map<String, Object> toMemberDetailMap(LibraryMember member) {
        StudentAdmission student = member.getStudentAdmission();
        StaffMember staff = member.getStaffMember();
        Map<String, Object> map = toMemberListMap(member);
        if (staff != null) {
            map.put("gender", nullToEmpty(staff.getGender()));
            map.put("photoPath", nullToEmpty(staff.getPhotoPath()));
            map.put("sessionYear", "2023-24");
            map.put("barcodeValue", staff.getStaffId() == null ? String.valueOf(member.getId()) : staff.getStaffId());
        } else {
            map.put("gender", student == null ? "" : nullToEmpty(student.getGender()));
            map.put("photoPath", student == null ? "" : nullToEmpty(student.getPhotoPath()));
            map.put("sessionYear", "2023-24");
            map.put("barcodeValue", student == null || student.getAdmissionNo() == null
                    ? String.valueOf(member.getId())
                    : student.getAdmissionNo());
        }
        return map;
    }

    private String staffFullName(StaffMember staff) {
        String first = nullToEmpty(staff.getFirstName());
        String last = nullToEmpty(staff.getLastName());
        return (first + " " + last).trim();
    }

    private Map<String, Object> toIssueMap(LibraryBookIssue issue) {
        Library book = issue.getBook();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", issue.getId());
        map.put("bookTitle", book == null ? "" : book.getTitle());
        map.put("bookNumber", book == null ? "" : book.getBookNumber());
        map.put("issueDate", formatUs(issue.getIssueDate()));
        map.put("dueDate", formatUs(issue.getDueDate()));
        map.put("returnDate", formatUs(issue.getReturnDate()));
        map.put("returned", issue.getReturnDate() != null);
        return map;
    }

    private String fullName(StudentAdmission student) {
        String first = nullToEmpty(student.getFirstName());
        String last = nullToEmpty(student.getLastName());
        return (first + " " + last).trim();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatUs(LocalDate date) {
        return date == null ? "" : date.format(US);
    }

    private Long parseLong(Object value, String label) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " is invalid");
        }
    }

    private LocalDate parseDate(Object value, boolean required) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            if (required) {
                return null;
            }
            return LocalDate.now();
        }
        String raw = String.valueOf(value).trim();
        try {
            if (raw.contains("-")) {
                return LocalDate.parse(raw, ISO);
            }
            return LocalDate.parse(raw, US);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Due Return Date must be a valid date");
        }
    }
}
