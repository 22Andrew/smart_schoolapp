package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.ExamGroupExamRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PrintAdmitCardService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final ExamGroupExamRepository examGroupExamRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long groupId,
                                                    Long examId,
                                                    String sessionYear,
                                                    Long classId,
                                                    String section) {
        if (groupId == null) {
            throw new IllegalArgumentException("Exam group is required");
        }
        if (examId == null) {
            throw new IllegalArgumentException("Exam is required");
        }
        if (sessionYear == null || sessionYear.isBlank()) {
            throw new IllegalArgumentException("Session is required");
        }
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found for selected group"));

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo() != null ? student.getAdmissionNo() : "");
            row.put("studentName", fullName(student));
            row.put("fatherName", student.getFatherName() != null ? student.getFatherName() : "");
            row.put("dateOfBirth", student.getDateOfBirth() != null
                    ? student.getDateOfBirth().format(US_DATE) : "");
            row.put("gender", student.getGender() != null ? student.getGender() : "");
            row.put("category", student.getCategory() != null
                    ? student.getCategory().getCategoryName() : "");
            row.put("mobileNumber", student.getMobileNumber() != null ? student.getMobileNumber() : "");
            row.put("sessionYear", sessionYear.trim());
            rows.add(row);
        }
        return rows;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }
}
