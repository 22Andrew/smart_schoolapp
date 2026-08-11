package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.BehaviourIncident;
import com.kantechsolution.smart_school.model.BehaviourStudentIncident;
import com.kantechsolution.smart_school.repository.BehaviourIncidentRepository;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BehaviourReportService {

    @Autowired
    private BehaviourStudentIncidentService studentIncidentService;

    @Autowired
    private BehaviourStudentIncidentRepository studentIncidentRepository;

    @Autowired
    private BehaviourIncidentRepository incidentRepository;

    @Autowired
    private StudentAdmissionService studentAdmissionService;

    public List<Map<String, Object>> studentIncidentReport(Long classId, String section) {
        return studentIncidentService.studentIncidentReport(classId, section);
    }

    public List<Map<String, Object>> studentBehaviourRankReport(Long classId, String section) {
        List<Map<String, Object>> rows = studentIncidentService.studentIncidentReport(classId, section);
        rows.sort(Comparator.comparingInt((Map<String, Object> r) -> toInt(r.get("totalPoints"))).reversed());
        int rank = 1;
        for (Map<String, Object> row : rows) {
            row.put("rank", rank++);
        }
        return rows;
    }

    public List<Map<String, Object>> classWiseRankReport() {
        List<Map<String, Object>> students = studentAdmissionService.searchAdmissions(null, null, null, false, null);
        Map<String, Agg> byClass = new LinkedHashMap<>();

        for (Map<String, Object> student : students) {
            String className = text(student.get("className"));
            if (className.isBlank()) className = "Unassigned";
            Agg agg = byClass.computeIfAbsent(className, key -> new Agg());
            agg.students += 1;
        }

        Map<Long, Integer> pointsByStudent = pointsMap();
        for (Map<String, Object> student : students) {
            Long id = toLong(student.get("id"));
            String className = text(student.get("className"));
            if (className.isBlank()) className = "Unassigned";
            Agg agg = byClass.get(className);
            if (agg != null) {
                agg.points += pointsByStudent.getOrDefault(id, 0);
            }
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Agg> entry : byClass.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("className", entry.getKey());
            row.put("totalStudents", entry.getValue().students);
            row.put("totalPoints", entry.getValue().points);
            rows.add(row);
        }
        rows.sort(Comparator.comparingInt((Map<String, Object> r) -> toInt(r.get("totalPoints"))).reversed());
        int rank = 1;
        for (Map<String, Object> row : rows) {
            row.put("rank", rank++);
        }
        return rows;
    }

    public List<Map<String, Object>> classSectionWiseRankReport() {
        List<Map<String, Object>> students = studentAdmissionService.searchAdmissions(null, null, null, false, null);
        Map<String, Agg> byKey = new LinkedHashMap<>();

        for (Map<String, Object> student : students) {
            String className = text(student.get("className"));
            String section = text(student.get("section"));
            if (className.isBlank()) className = "Unassigned";
            if (section.isBlank()) section = "-";
            String key = className + "||" + section;
            Agg agg = byKey.computeIfAbsent(key, k -> new Agg());
            agg.students += 1;
            agg.className = className;
            agg.section = section;
        }

        Map<Long, Integer> pointsByStudent = pointsMap();
        for (Map<String, Object> student : students) {
            Long id = toLong(student.get("id"));
            String className = text(student.get("className"));
            String section = text(student.get("section"));
            if (className.isBlank()) className = "Unassigned";
            if (section.isBlank()) section = "-";
            String key = className + "||" + section;
            Agg agg = byKey.get(key);
            if (agg != null) {
                agg.points += pointsByStudent.getOrDefault(id, 0);
            }
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Agg agg : byKey.values()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("className", agg.className);
            row.put("section", agg.section);
            row.put("classLabel", agg.className + " (" + agg.section + ")");
            row.put("totalStudents", agg.students);
            row.put("totalPoints", agg.points);
            rows.add(row);
        }
        rows.sort(Comparator.comparingInt((Map<String, Object> r) -> toInt(r.get("totalPoints"))).reversed());
        int rank = 1;
        for (Map<String, Object> row : rows) {
            row.put("rank", rank++);
        }
        return rows;
    }

    public List<Map<String, Object>> houseWiseRankReport() {
        List<Map<String, Object>> students = studentAdmissionService.searchAdmissions(null, null, null, false, null);
        Map<String, Agg> byHouse = new LinkedHashMap<>();

        for (Map<String, Object> student : students) {
            String house = text(student.get("houseName"));
            if (house.isBlank()) house = "Unassigned";
            Agg agg = byHouse.computeIfAbsent(house, key -> new Agg());
            agg.students += 1;
        }

        Map<Long, Integer> pointsByStudent = pointsMap();
        for (Map<String, Object> student : students) {
            Long id = toLong(student.get("id"));
            String house = text(student.get("houseName"));
            if (house.isBlank()) house = "Unassigned";
            Agg agg = byHouse.get(house);
            if (agg != null) {
                agg.points += pointsByStudent.getOrDefault(id, 0);
            }
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Agg> entry : byHouse.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("houseName", entry.getKey());
            row.put("totalStudents", entry.getValue().students);
            row.put("totalPoints", entry.getValue().points);
            rows.add(row);
        }
        rows.sort(Comparator.comparingInt((Map<String, Object> r) -> toInt(r.get("totalPoints"))).reversed());
        int rank = 1;
        for (Map<String, Object> row : rows) {
            row.put("rank", rank++);
        }
        return rows;
    }

    public List<Map<String, Object>> incidentWiseReport() {
        List<BehaviourIncident> masters = incidentRepository.findByActiveTrueOrderByIdAsc();
        Map<Long, Long> countByIncident = studentIncidentRepository.findAll().stream()
                .filter(row -> row.getIncidentId() != null)
                .collect(Collectors.groupingBy(BehaviourStudentIncident::getIncidentId, Collectors.counting()));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (BehaviourIncident incident : masters) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", incident.getId());
            row.put("title", incident.getTitle());
            row.put("points", incident.getPoints() == null ? 0 : incident.getPoints());
            row.put("description", incident.getDescription());
            row.put("totalAssigned", countByIncident.getOrDefault(incident.getId(), 0L));
            rows.add(row);
        }
        rows.sort(Comparator.comparingLong((Map<String, Object> r) -> ((Number) r.get("totalAssigned")).longValue()).reversed());
        return rows;
    }

    private Map<Long, Integer> pointsMap() {
        List<BehaviourStudentIncident> all = studentIncidentRepository.findAll();
        Map<Long, Integer> map = new HashMap<>();
        for (BehaviourStudentIncident row : all) {
            if (row.getStudentAdmissionId() == null) continue;
            map.merge(row.getStudentAdmissionId(), row.getPoints() == null ? 0 : row.getPoints(), Integer::sum);
        }
        return map;
    }

    private static class Agg {
        int students;
        int points;
        String className;
        String section;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (Exception e) {
            return 0;
        }
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
