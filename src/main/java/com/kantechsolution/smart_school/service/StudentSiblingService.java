package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentSibling;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentSiblingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class StudentSiblingService {

    @Autowired
    private StudentSiblingRepository studentSiblingRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    public List<Map<String, Object>> listSiblings(Long studentId, String draftToken) {
        List<Map<String, Object>> result = new ArrayList<>();

        if (studentId != null) {
            Set<Long> siblingIds = collectSiblingGroup(studentId);
            siblingIds.remove(studentId);
            for (Long siblingId : siblingIds) {
                studentAdmissionRepository.findById(siblingId).ifPresent(sibling -> {
                    result.add(toSiblingMap(null, sibling));
                });
            }
            return result;
        }

        if (draftToken == null || draftToken.isBlank()) {
            return List.of();
        }

        for (StudentSibling row : studentSiblingRepository.findByDraftTokenOrderByIdAsc(draftToken.trim())) {
            studentAdmissionRepository.findById(row.getSiblingAdmissionId()).ifPresent(sibling -> {
                result.add(toSiblingMap(row, sibling));
            });
        }
        return result;
    }

    private Set<Long> collectSiblingGroup(Long studentId) {
        Set<Long> visited = new LinkedHashSet<>();
        Deque<Long> queue = new ArrayDeque<>();
        queue.add(studentId);
        visited.add(studentId);
        while (!queue.isEmpty()) {
            Long current = queue.removeFirst();
            for (StudentSibling row : studentSiblingRepository.findByStudentAdmissionIdOrderByIdAsc(current)) {
                Long next = row.getSiblingAdmissionId();
                if (next != null && visited.add(next)) {
                    queue.add(next);
                }
            }
        }
        return visited;
    }

    @Transactional
    public Map<String, Object> addSibling(Long studentId, Long siblingId, String draftToken) {
        if (siblingId == null) {
            throw new IllegalArgumentException("Student is required");
        }

        StudentAdmission sibling = studentAdmissionRepository.findById(siblingId)
                .orElseThrow(() -> new IllegalArgumentException("Selected student was not found"));

        if (studentId != null && studentId.equals(siblingId)) {
            throw new IllegalArgumentException("A student cannot be added as their own sibling");
        }

        if (studentId != null) {
            if (studentAdmissionRepository.findById(studentId).isEmpty()) {
                throw new IllegalArgumentException("Student admission not found");
            }
            if (studentSiblingRepository.existsByStudentAdmissionIdAndSiblingAdmissionId(studentId, siblingId)) {
                throw new IllegalArgumentException("This sibling is already linked");
            }
            createBidirectionalLink(studentId, siblingId, null);
        } else {
            String token = requiredDraftToken(draftToken);
            if (studentSiblingRepository.existsByDraftTokenAndSiblingAdmissionId(token, siblingId)) {
                throw new IllegalArgumentException("This sibling is already added");
            }
            StudentSibling draft = new StudentSibling();
            draft.setSiblingAdmissionId(siblingId);
            draft.setDraftToken(token);
            studentSiblingRepository.save(draft);
        }

        return toSiblingMap(null, sibling);
    }

    @Transactional
    public void finalizeDraftSiblings(Long studentId, String draftToken) {
        if (studentId == null || draftToken == null || draftToken.isBlank()) {
            return;
        }

        String token = draftToken.trim();
        List<StudentSibling> drafts = studentSiblingRepository.findByDraftTokenOrderByIdAsc(token);
        for (StudentSibling draft : drafts) {
            Long siblingId = draft.getSiblingAdmissionId();
            if (!studentSiblingRepository.existsByStudentAdmissionIdAndSiblingAdmissionId(studentId, siblingId)) {
                createBidirectionalLink(studentId, siblingId, null);
            }
            studentSiblingRepository.delete(draft);
        }
    }

    @Transactional
    public void removeSibling(Long studentId, Long siblingId, String draftToken) {
        if (siblingId == null) {
            throw new IllegalArgumentException("Sibling id is required");
        }

        if (studentId != null) {
            studentSiblingRepository.deleteByStudentAdmissionIdAndSiblingAdmissionId(studentId, siblingId);
            studentSiblingRepository.deleteByStudentAdmissionIdAndSiblingAdmissionId(siblingId, studentId);
            return;
        }

        String token = requiredDraftToken(draftToken);
        studentSiblingRepository.findByDraftTokenOrderByIdAsc(token).stream()
                .filter(row -> siblingId.equals(row.getSiblingAdmissionId()))
                .findFirst()
                .ifPresent(studentSiblingRepository::delete);
    }

    private void createBidirectionalLink(Long studentId, Long siblingId, String draftToken) {
        saveLink(studentId, siblingId, draftToken);
        if (!studentId.equals(siblingId)
                && !studentSiblingRepository.existsByStudentAdmissionIdAndSiblingAdmissionId(siblingId, studentId)) {
            saveLink(siblingId, studentId, null);
        }
    }

    private void saveLink(Long studentId, Long siblingId, String draftToken) {
        StudentSibling link = new StudentSibling();
        link.setStudentAdmissionId(studentId);
        link.setSiblingAdmissionId(siblingId);
        link.setDraftToken(draftToken);
        studentSiblingRepository.save(link);
    }

    private String requiredDraftToken(String draftToken) {
        if (draftToken == null || draftToken.isBlank()) {
            throw new IllegalArgumentException("Draft token is required before the student is saved");
        }
        return draftToken.trim();
    }

    private Map<String, Object> toSiblingMap(StudentSibling row, StudentAdmission sibling) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (row != null) {
            map.put("id", row.getId());
        }
        map.put("siblingId", sibling.getId());
        map.put("admissionNo", sibling.getAdmissionNo());
        map.put("studentName", fullName(sibling));
        map.put("rollNumber", sibling.getRollNumber());
        map.put("gender", sibling.getGender());
        map.put("dateOfBirth", sibling.getDateOfBirth() != null ? sibling.getDateOfBirth().toString() : null);
        map.put("className", sibling.getSchoolClass() != null ? sibling.getSchoolClass().getName() : "");
        map.put("section", sibling.getSection());
        map.put("photoPath", sibling.getPhotoPath());
        map.put("photoUrl", sibling.getPhotoPath());
        return map;
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        return (first + " " + last).trim();
    }
}
