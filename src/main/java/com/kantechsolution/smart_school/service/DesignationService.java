package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Designation;
import com.kantechsolution.smart_school.repository.DesignationRepository;
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
public class DesignationService implements ApplicationRunner {

    private final DesignationRepository designationRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (designationRepository.count() > 0) {
            return;
        }
        seedDesignations();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return designationRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getDesignationNames() {
        return designationRepository.findAllByOrderByNameAsc()
                .stream()
                .map(Designation::getName)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Designation not found"));
        return toMap(designation);
    }

    @Transactional
    public Map<String, Object> createDesignation(Map<String, Object> payload) {
        String name = requiredName(payload.get("name"));
        if (designationRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Designation already exists");
        }

        Designation designation = Designation.builder()
                .name(name)
                .build();
        designation.setIsActive(true);
        return toMap(designationRepository.save(designation));
    }

    @Transactional
    public Map<String, Object> updateDesignation(Long id, Map<String, Object> payload) {
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Designation not found"));

        String name = requiredName(payload.get("name"));
        if (designationRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Designation already exists");
        }

        designation.setName(name);
        return toMap(designationRepository.save(designation));
    }

    @Transactional
    public void deleteDesignation(Long id) {
        if (!designationRepository.existsById(id)) {
            throw new IllegalArgumentException("Designation not found");
        }
        designationRepository.deleteById(id);
    }

    private void seedDesignations() {
        List<String> defaults = List.of(
                "Faculty",
                "Accountant",
                "Admin",
                "Receptionist",
                "Principal",
                "Director",
                "Librarian",
                "Technical Head",
                "Vice Principal"
        );

        for (String name : defaults) {
            Designation designation = Designation.builder().name(name).build();
            designation.setIsActive(true);
            designationRepository.save(designation);
        }
    }

    private Map<String, Object> toMap(Designation designation) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", designation.getId());
        row.put("name", designation.getName());
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
