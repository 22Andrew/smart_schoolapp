package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeesForward;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.FeesForwardRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
@Service
public class FeesForwardService {

    @Autowired
    private FeesForwardRepository feesForwardRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    public List<Map<String, Object>> search(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = section == null ? "" : section.trim();
        if (normalizedSection.isEmpty()) {
            throw new IllegalArgumentException("Section is required");
        }

        List<StudentAdmission> students = studentAdmissionRepository.search(classId, normalizedSection, null);
        Map<Long, FeesForward> existingByStudent = new HashMap<>();
        for (FeesForward row : feesForwardRepository.findByClassIdAndSectionIgnoreCase(classId, normalizedSection)) {
            existingByStudent.put(row.getStudentAdmissionId(), row);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate dueDate = null;
        for (StudentAdmission student : students) {
            FeesForward existing = existingByStudent.get(student.getId());
            if (existing != null && existing.getDueDate() != null && dueDate == null) {
                dueDate = existing.getDueDate();
            }

            Map<String, Object> row = new HashMap<>();
            row.put("studentAdmissionId", student.getId());
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            row.put("admissionDate", student.getAdmissionDate());
            row.put("rollNumber", student.getRollNumber());
            row.put("fatherName", student.getFatherName());
            row.put("balance", existing != null && existing.getBalance() != null ? existing.getBalance() : 0.0);
            row.put("status", existing != null ? existing.getStatus() : "");
            row.put("feesForwardId", existing != null ? existing.getId() : null);
            row.put("classId", classId);
            row.put("section", student.getSection());
            result.add(row);
        }

        if (dueDate != null) {
            for (Map<String, Object> row : result) {
                row.put("dueDate", dueDate);
            }
        }
        return result;
    }

    @Transactional
    public List<FeesForward> saveBalances(Long classId, String section, LocalDate dueDate, List<Map<String, Object>> items) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = required(section, "Section is required");
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("No student balances to save");
        }

        List<FeesForward> saved = new ArrayList<>();
        for (Map<String, Object> item : items) {
            Long studentId = asLong(item.get("studentAdmissionId"));
            if (studentId == null) {
                throw new IllegalArgumentException("Student is required");
            }
            StudentAdmission student = studentAdmissionRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));

            Double balance = asDouble(item.get("balance"));
            if (balance == null || balance < 0) {
                throw new IllegalArgumentException("Balance must be zero or greater");
            }

            FeesForward row = feesForwardRepository.findByStudentAdmissionId(studentId).orElseGet(FeesForward::new);
            row.setStudentAdmissionId(student.getId());
            row.setClassId(classId);
            row.setSection(normalizedSection.toUpperCase(Locale.ROOT));
            row.setBalance(balance);
            row.setStatus("Assigned");
            row.setDueDate(dueDate);
            saved.add(feesForwardRepository.save(row));
        }
        return saved;
    }

    @Transactional
    public void deleteCarryForward(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = required(section, "Section is required");
        feesForwardRepository.deleteByClassIdAndSectionIgnoreCase(classId, normalizedSection);
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        return (first + " " + last).trim();
    }

    private String required(String value, String message) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double asDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid balance value");
        }
    }
}
