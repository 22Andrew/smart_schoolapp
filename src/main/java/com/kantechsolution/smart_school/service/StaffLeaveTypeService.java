package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffLeaveType;
import com.kantechsolution.smart_school.repository.StaffLeaveTypeRepository;
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
@Order(6)
public class StaffLeaveTypeService implements ApplicationRunner {

    private final StaffLeaveTypeRepository leaveTypeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (leaveTypeRepository.count() > 0) {
            return;
        }
        seedLeaveTypes();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return leaveTypeRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getLeaveTypeNames() {
        return leaveTypeRepository.findAllByOrderByNameAsc()
                .stream()
                .map(StaffLeaveType::getName)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        StaffLeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave type not found"));
        return toMap(leaveType);
    }

    @Transactional
    public Map<String, Object> createLeaveType(Map<String, Object> payload) {
        String name = requiredName(payload.get("name"));
        if (leaveTypeRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Leave type already exists");
        }

        StaffLeaveType leaveType = StaffLeaveType.builder()
                .name(name)
                .build();
        leaveType.setIsActive(true);
        return toMap(leaveTypeRepository.save(leaveType));
    }

    @Transactional
    public Map<String, Object> updateLeaveType(Long id, Map<String, Object> payload) {
        StaffLeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave type not found"));

        String name = requiredName(payload.get("name"));
        if (leaveTypeRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Leave type already exists");
        }

        leaveType.setName(name);
        return toMap(leaveTypeRepository.save(leaveType));
    }

    @Transactional
    public void deleteLeaveType(Long id) {
        if (!leaveTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Leave type not found");
        }
        leaveTypeRepository.deleteById(id);
    }

    private void seedLeaveTypes() {
        List<String> defaults = List.of(
                "Medical Leave",
                "Casual Leave",
                "Maternity Leave",
                "Sick Leave",
                "mandatory leave"
        );

        for (String name : defaults) {
            StaffLeaveType leaveType = StaffLeaveType.builder().name(name).build();
            leaveType.setIsActive(true);
            leaveTypeRepository.save(leaveType);
        }
    }

    private Map<String, Object> toMap(StaffLeaveType leaveType) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", leaveType.getId());
        row.put("name", leaveType.getName());
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
