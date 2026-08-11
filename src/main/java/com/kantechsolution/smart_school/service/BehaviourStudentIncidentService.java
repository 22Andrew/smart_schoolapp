package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.BehaviourIncident;
import com.kantechsolution.smart_school.model.BehaviourStudentIncident;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BehaviourStudentIncidentService {

    @Autowired
    private BehaviourStudentIncidentRepository repository;

    @Autowired
    private StudentAdmissionService studentAdmissionService;

    @Autowired
    private BehaviourIncidentService behaviourIncidentService;

    public List<Map<String, Object>> searchStudents(Long classId, String section) {
        return searchStudentsWithStats(classId, section, false);
    }

    public List<Map<String, Object>> studentIncidentReport(Long classId, String section) {
        return searchStudentsWithStats(classId, section, true);
    }

    private List<Map<String, Object>> searchStudentsWithStats(Long classId, String section, boolean includeCounts) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }

        List<Map<String, Object>> students = studentAdmissionService.searchAdmissions(
                classId, section, null, false, null);

        List<Long> ids = students.stream()
                .map(row -> toLong(row.get("id")))
                .filter(id -> id != null)
                .collect(Collectors.toList());

        Map<Long, Integer> pointsByStudent = new HashMap<>();
        Map<Long, Integer> countByStudent = new HashMap<>();
        if (!ids.isEmpty()) {
            if (includeCounts) {
                for (Object[] row : repository.countAndSumPointsByStudentIds(ids)) {
                    Long studentId = toLong(row[0]);
                    Integer count = row[1] == null ? 0 : ((Number) row[1]).intValue();
                    Integer points = row[2] == null ? 0 : ((Number) row[2]).intValue();
                    if (studentId != null) {
                        countByStudent.put(studentId, count);
                        pointsByStudent.put(studentId, points);
                    }
                }
            } else {
                for (Object[] row : repository.sumPointsByStudentIds(ids)) {
                    Long studentId = toLong(row[0]);
                    Integer points = row[1] == null ? 0 : ((Number) row[1]).intValue();
                    if (studentId != null) {
                        pointsByStudent.put(studentId, points);
                    }
                }
            }
        }

        for (Map<String, Object> student : students) {
            Long id = toLong(student.get("id"));
            student.put("totalPoints", pointsByStudent.getOrDefault(id, 0));
            if (includeCounts) {
                student.put("totalIncidents", countByStudent.getOrDefault(id, 0));
            }
        }
        return students;
    }

    public List<Map<String, Object>> listByStudent(Long studentAdmissionId) {
        if (studentAdmissionId == null) {
            throw new IllegalArgumentException("Student is required");
        }
        return repository.findByStudentAdmissionIdOrderByIncidentDateDescIdDesc(studentAdmissionId)
                .stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Map<String, Object>> assignSelected(Map<String, Object> body) {
        Long studentAdmissionId = toLong(body.get("studentAdmissionId"));
        if (studentAdmissionId == null) {
            throw new IllegalArgumentException("Student is required");
        }
        if (studentAdmissionService.getById(studentAdmissionId).isEmpty()) {
            throw new IllegalArgumentException("Student not found");
        }

        List<Long> incidentIds = toLongList(body.get("incidentIds"));
        if (incidentIds.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one incident");
        }

        LocalDate incidentDate = toDate(body.get("incidentDate"));
        String assignedBy = currentAssignBy();
        List<Map<String, Object>> saved = new ArrayList<>();

        for (Long incidentId : incidentIds) {
            BehaviourIncident master = behaviourIncidentService.requireActive(incidentId);
            BehaviourStudentIncident row = new BehaviourStudentIncident();
            row.setStudentAdmissionId(studentAdmissionId);
            row.setIncidentId(master.getId());
            row.setTitle(master.getTitle());
            row.setPoints(master.getPoints() == null ? 0 : master.getPoints());
            row.setDescription(master.getDescription());
            row.setIncidentDate(incidentDate);
            row.setAssignedBy(assignedBy);
            saved.add(toMap(repository.save(row)));
        }
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        if (id == null || !repository.existsById(id)) {
            throw new IllegalArgumentException("Incident not found");
        }
        repository.deleteById(id);
    }

    private Map<String, Object> toMap(BehaviourStudentIncident row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("studentAdmissionId", row.getStudentAdmissionId());
        map.put("incidentId", row.getIncidentId());
        map.put("title", row.getTitle());
        map.put("points", row.getPoints() == null ? 0 : row.getPoints());
        map.put("session", sessionLabel(row.getIncidentDate()));
        map.put("incidentDate", row.getIncidentDate() != null ? row.getIncidentDate().toString() : null);
        map.put("description", row.getDescription());
        map.put("assignedBy", row.getAssignedBy() == null || row.getAssignedBy().isBlank()
                ? "" : row.getAssignedBy());
        map.put("createdAt", row.getCreatedAt() != null ? row.getCreatedAt().toString() : null);
        return map;
    }

    private String sessionLabel(LocalDate date) {
        LocalDate value = date != null ? date : LocalDate.now();
        int year = value.getYear();
        int startYear = value.getMonthValue() >= 4 ? year : year - 1;
        int endYear = (startYear + 1) % 100;
        return startYear + "-" + String.format("%02d", endYear);
    }

    private String currentAssignBy() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return "System";
        }
        return switch (auth.getName()) {
            case "superadmin@gmail.com" -> "Joe Black (9000)";
            case "admin@gmail.com" -> "Admin (9001)";
            case "teacher@gmail.com" -> "Teacher (9002)";
            case "accountant@gmail.com" -> "Accountant (9003)";
            case "receptionist@gmail.com" -> "Receptionist (9004)";
            case "librarian@gmail.com" -> "Librarian (9005)";
            default -> auth.getName();
        };
    }

    private List<Long> toLongList(Object value) {
        List<Long> ids = new ArrayList<>();
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                Long id = toLong(item);
                if (id != null) {
                    ids.add(id);
                }
            }
        } else if (value != null) {
            Long id = toLong(value);
            if (id != null) {
                ids.add(id);
            }
        }
        return ids;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return null;
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate toDate(Object value) {
        if (value == null) return LocalDate.now();
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return LocalDate.now();
        try {
            return LocalDate.parse(text);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid incident date");
        }
    }
}
