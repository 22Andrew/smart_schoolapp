package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeGroup;
import com.kantechsolution.smart_school.model.FeeGroupAssignment;
import com.kantechsolution.smart_school.model.FeeMaster;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.FeeGroupAssignmentRepository;
import com.kantechsolution.smart_school.repository.FeeGroupRepository;
import com.kantechsolution.smart_school.repository.FeeMasterRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DueFeesSearchService {

    @Autowired
    private FeeGroupRepository feeGroupRepository;

    @Autowired
    private FeeGroupAssignmentRepository assignmentRepository;

    @Autowired
    private FeeMasterRepository feeMasterRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    public List<Map<String, Object>> searchDueFees(Long feeGroupId, Long classId, String section, String sessionYear) {
        if (feeGroupId == null) {
            throw new IllegalArgumentException("Fees group is required");
        }

        FeeGroup group = feeGroupRepository.findById(feeGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));
        String session = normalizeSession(sessionYear);
        String normalizedSection = section == null ? "" : section.trim();

        List<FeeMaster> masters = feeMasterRepository.findByFeeGroupIdOrderByIdAsc(feeGroupId).stream()
                .filter(m -> session.equals(m.getSessionYear()))
                .toList();
        if (masters.isEmpty()) {
            return List.of();
        }

        List<FeeGroupAssignment> assignments = assignmentRepository.findByFeeGroupIdAndSessionYear(feeGroupId, session);
        List<Map<String, Object>> rows = new ArrayList<>();

        for (FeeGroupAssignment assignment : assignments) {
            Optional<StudentAdmission> studentOpt = studentAdmissionRepository.findById(assignment.getStudentAdmissionId());
            if (studentOpt.isEmpty()) {
                continue;
            }
            StudentAdmission student = studentOpt.get();

            if (classId != null) {
                if (student.getSchoolClass() == null || !classId.equals(student.getSchoolClass().getId())) {
                    continue;
                }
            }
            if (!normalizedSection.isEmpty()) {
                if (student.getSection() == null || !student.getSection().equalsIgnoreCase(normalizedSection)) {
                    continue;
                }
            }

            for (FeeMaster master : masters) {
                rows.add(toRow(student, group, master));
            }
        }

        return rows;
    }

    private Map<String, Object> toRow(StudentAdmission student, FeeGroup group, FeeMaster master) {
        double amount = master.getAmount() == null ? 0.0 : master.getAmount();
        double paid = 0.0;
        double discount = 0.0;
        double fine = 0.0;
        double balance = amount - paid - discount + fine;

        String classLabel = "";
        if (student.getSchoolClass() != null && student.getSchoolClass().getName() != null) {
            classLabel = student.getSchoolClass().getName();
            if (student.getSection() != null && !student.getSection().isBlank()) {
                classLabel = classLabel + "-" + student.getSection();
            }
        }

        String feeTypeName = master.getFeeType() != null ? master.getFeeType().getName() : "";
        String feesCode = master.getFeeType() != null ? master.getFeeType().getFeesCode() : "";
        String feesGroupLabel = group.getName()
                + " (" + feeTypeName + " : " + feesCode + ")";

        Map<String, Object> row = new HashMap<>();
        row.put("studentAdmissionId", student.getId());
        row.put("feeMasterId", master.getId());
        row.put("feeGroupId", group.getId());
        row.put("classLabel", classLabel);
        row.put("admissionNo", student.getAdmissionNo());
        row.put("studentName", fullName(student));
        row.put("feesGroupLabel", feesGroupLabel);
        row.put("amount", amount);
        row.put("paid", paid);
        row.put("discount", discount);
        row.put("fine", fine);
        row.put("balance", balance);
        return row;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        return (first + " " + last).trim();
    }

    private String normalizeSession(String sessionYear) {
        String session = sessionYear == null ? "" : sessionYear.trim();
        return session.isEmpty() ? FeeMasterService.DEFAULT_SESSION : session;
    }
}
