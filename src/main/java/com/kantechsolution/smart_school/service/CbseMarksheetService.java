package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.CbseExamTemplateRepository;
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
public class CbseMarksheetService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final CbseExamTemplateRepository templateRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTemplateOptions() {
        return templateRepository.findAllByOrderByTemplateNameAsc().stream()
                .map(template -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", template.getId());
                    map.put("templateName", template.getTemplateName());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section, Long templateId) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        if (templateId == null) {
            throw new IllegalArgumentException("Template is required");
        }
        if (!templateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("Template not found");
        }

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo());
            row.put("studentName", fullName(student));
            row.put("fatherName", student.getFatherName() != null ? student.getFatherName() : "");
            row.put("dateOfBirth", student.getDateOfBirth() != null
                    ? student.getDateOfBirth().format(US_DATE) : "");
            row.put("gender", student.getGender());
            row.put("mobileNumber", student.getMobileNumber() != null ? student.getMobileNumber() : "");
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
