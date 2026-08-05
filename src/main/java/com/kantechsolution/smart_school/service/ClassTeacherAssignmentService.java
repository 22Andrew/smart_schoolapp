package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ClassTeacherAssignment;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.repository.ClassTeacherAssignmentRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class ClassTeacherAssignmentService {

    @Autowired
    private ClassTeacherAssignmentRepository assignmentRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    public List<Map<String, Object>> getAssignableTeachers() {
        List<Map<String, Object>> teachers = new ArrayList<>();
        teachers.add(teacher("9002", "Shivam Verma"));
        teachers.add(teacher("90006", "Jason Sharlton"));
        teachers.add(teacher("1002", "Nishant Khare"));
        teachers.add(teacher("654", "Aman Verma"));
        teachers.add(teacher("90005", "Jason Sharpu"));
        teachers.add(teacher("6789", "Albert Thomas"));
        return teachers;
    }

    public List<Map<String, Object>> getAllAssignments() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ClassTeacherAssignment row : assignmentRepository.findAllByOrderByIdDesc()) {
            result.add(toMap(row));
        }
        return result;
    }

    public Optional<Map<String, Object>> getById(Long id) {
        return assignmentRepository.findById(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Long classId, String section, String teacherCode, String teacherName) {
        ClassTeacherAssignment assignment = new ClassTeacherAssignment();
        applyFields(assignment, classId, section, teacherCode, teacherName, null);
        return toMap(assignmentRepository.save(assignment));
    }

    @Transactional
    public Map<String, Object> update(Long id, Long classId, String section, String teacherCode, String teacherName) {
        ClassTeacherAssignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        applyFields(existing, classId, section, teacherCode, teacherName, id);
        return toMap(assignmentRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Assignment not found");
        }
        assignmentRepository.deleteById(id);
    }

    private void applyFields(ClassTeacherAssignment assignment, Long classId, String section,
                             String teacherCode, String teacherName, Long currentId) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = normalizeSection(section);
        String code = teacherCode == null ? "" : teacherCode.trim();
        String name = teacherName == null ? "" : teacherName.trim();

        if (code.isEmpty()) {
            throw new IllegalArgumentException("Class Teacher is required");
        }
        if (name.isEmpty()) {
            name = resolveTeacherName(code);
        }

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));

        boolean sectionAllowed = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(s -> s != null && s.equalsIgnoreCase(normalizedSection));
        if (!sectionAllowed) {
            throw new IllegalArgumentException("Section " + normalizedSection + " is not available for the selected class");
        }

        Optional<ClassTeacherAssignment> duplicate =
                assignmentRepository.findBySchoolClassIdAndSectionIgnoreCase(classId, normalizedSection);
        if (duplicate.isPresent() && (currentId == null || !duplicate.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("A class teacher is already assigned to this class and section");
        }

        assignment.setSchoolClass(schoolClass);
        assignment.setSection(normalizedSection);
        assignment.setTeacherCode(code);
        assignment.setTeacherName(name);
    }

    private String resolveTeacherName(String code) {
        return getAssignableTeachers().stream()
                .filter(t -> code.equals(String.valueOf(t.get("code"))))
                .map(t -> String.valueOf(t.get("name")))
                .findFirst()
                .orElse(code);
    }

    private Map<String, Object> toMap(ClassTeacherAssignment row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("classId", row.getSchoolClass() != null ? row.getSchoolClass().getId() : null);
        map.put("className", row.getSchoolClass() != null ? row.getSchoolClass().getName() : null);
        map.put("section", row.getSection());
        map.put("teacherCode", row.getTeacherCode());
        map.put("teacherName", row.getTeacherName());
        map.put("teacherDisplay", row.getTeacherName() + " (" + row.getTeacherCode() + ")");
        return map;
    }

    private Map<String, Object> teacher(String code, String name) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("code", code);
        map.put("name", name);
        map.put("display", name + " (" + code + ")");
        return map;
    }

    private String normalizeSection(String section) {
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        return section.trim().toUpperCase(Locale.ROOT);
    }
}
