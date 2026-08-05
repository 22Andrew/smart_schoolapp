package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service for school class persistence
 */
@Service
public class SchoolClassService {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    public List<SchoolClass> getAllClasses() {
        return schoolClassRepository.findAllByOrderByIdAsc();
    }

    public Optional<SchoolClass> getClassById(Long id) {
        return schoolClassRepository.findById(id);
    }

    @Transactional
    public SchoolClass createClass(String name, List<String> sections) {
        String trimmedName = normalizeName(name);
        List<String> normalizedSections = normalizeSections(sections);

        if (schoolClassRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Class already exists");
        }

        return schoolClassRepository.save(new SchoolClass(trimmedName, normalizedSections));
    }

    @Transactional
    public SchoolClass updateClass(Long id, String name, List<String> sections) {
        String trimmedName = normalizeName(name);
        List<String> normalizedSections = normalizeSections(sections);

        SchoolClass existing = schoolClassRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        Optional<SchoolClass> duplicate = schoolClassRepository.findByNameIgnoreCase(trimmedName);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("Class already exists");
        }

        existing.setName(trimmedName);
        existing.setSections(normalizedSections);
        return schoolClassRepository.save(existing);
    }

    @Transactional
    public void deleteClass(Long id) {
        if (!schoolClassRepository.existsById(id)) {
            throw new IllegalArgumentException("Class not found");
        }
        schoolClassRepository.deleteById(id);
    }

    private String normalizeName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Class name is required");
        }
        return trimmed;
    }

    private List<String> normalizeSections(List<String> sections) {
        if (sections == null || sections.isEmpty()) {
            throw new IllegalArgumentException("At least one section is required");
        }
        Set<String> unique = new LinkedHashSet<>();
        for (String section : sections) {
            if (section == null) {
                continue;
            }
            String value = section.trim().toUpperCase();
            if (!value.isEmpty()) {
                unique.add(value);
            }
        }
        if (unique.isEmpty()) {
            throw new IllegalArgumentException("At least one section is required");
        }
        return new ArrayList<>(unique);
    }
}
