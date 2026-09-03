package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Department;
import com.kantechsolution.smart_school.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(5)
public class DepartmentService implements ApplicationRunner {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (departmentRepository.count() > 0) {
            return;
        }
        seedDepartments();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return departmentRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getDepartmentNames() {
        return departmentRepository.findAllByOrderByNameAsc()
                .stream()
                .map(Department::getName)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return toMap(department);
    }

    @Transactional
    public Map<String, Object> createDepartment(Map<String, Object> payload) {
        String name = requiredName(payload.get("name"));
        if (departmentRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Department already exists");
        }

        Department department = Department.builder()
                .name(name)
                .build();
        department.setIsActive(true);
        return toMap(departmentRepository.save(department));
    }

    @Transactional
    public Map<String, Object> updateDepartment(Long id, Map<String, Object> payload) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        String name = requiredName(payload.get("name"));
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Department already exists");
        }

        department.setName(name);
        return toMap(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Department not found");
        }
        departmentRepository.deleteById(id);
    }

    private void seedDepartments() {
        List<String> defaults = List.of(
                "Academic",
                "Library",
                "Sports",
                "Science",
                "Commerce",
                "Arts",
                "Exam",
                "Admin",
                "Finance",
                "Maths"
        );

        for (String name : defaults) {
            Department department = Department.builder().name(name).build();
            department.setIsActive(true);
            departmentRepository.save(department);
        }
    }

    private Map<String, Object> toMap(Department department) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", department.getId());
        row.put("name", department.getName());
        return row;
    }

    private String requiredName(Object value) {
        String name = value == null ? "" : value.toString().trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        return name;
    }
}
