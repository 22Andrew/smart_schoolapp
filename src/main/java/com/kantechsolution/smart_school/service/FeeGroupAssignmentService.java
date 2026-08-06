package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeGroup;
import com.kantechsolution.smart_school.model.FeeGroupAssignment;
import com.kantechsolution.smart_school.repository.FeeGroupAssignmentRepository;
import com.kantechsolution.smart_school.repository.FeeGroupRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FeeGroupAssignmentService {

    @Autowired
    private FeeGroupAssignmentRepository assignmentRepository;

    @Autowired
    private FeeGroupRepository feeGroupRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    public List<Long> getAssignedStudentIds(Long feeGroupId, String sessionYear) {
        String session = normalizeSession(sessionYear);
        return assignmentRepository.findByFeeGroupIdAndSessionYear(feeGroupId, session).stream()
                .map(FeeGroupAssignment::getStudentAdmissionId)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveAssignments(Long feeGroupId, String sessionYear, List<Long> studentIds) {
        FeeGroup group = feeGroupRepository.findById(feeGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));
        String session = normalizeSession(sessionYear);

        Set<Long> uniqueIds = new HashSet<>();
        if (studentIds != null) {
            for (Long id : studentIds) {
                if (id != null) {
                    uniqueIds.add(id);
                }
            }
        }

        for (Long studentId : uniqueIds) {
            if (!studentAdmissionRepository.existsById(studentId)) {
                throw new IllegalArgumentException("Student not found: " + studentId);
            }
        }

        assignmentRepository.deleteByFeeGroupIdAndSessionYear(group.getId(), session);

        List<FeeGroupAssignment> rows = new ArrayList<>();
        for (Long studentId : uniqueIds) {
            rows.add(new FeeGroupAssignment(group.getId(), studentId, session));
        }
        if (!rows.isEmpty()) {
            assignmentRepository.saveAll(rows);
        }
    }

    private String normalizeSession(String sessionYear) {
        String session = sessionYear == null ? "" : sessionYear.trim();
        return session.isEmpty() ? FeeMasterService.DEFAULT_SESSION : session;
    }
}
