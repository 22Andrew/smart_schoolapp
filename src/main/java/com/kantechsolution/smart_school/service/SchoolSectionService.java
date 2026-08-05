package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolSection;
import com.kantechsolution.smart_school.repository.SchoolSectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for school section persistence
 */
@Service
public class SchoolSectionService {

    @Autowired
    private SchoolSectionRepository schoolSectionRepository;

    public List<SchoolSection> getAllSections() {
        return schoolSectionRepository.findAllByOrderByIdAsc();
    }

    public Optional<SchoolSection> getSectionById(Long id) {
        return schoolSectionRepository.findById(id);
    }

    @Transactional
    public SchoolSection createSection(String sectionName) {
        String trimmed = normalizeName(sectionName);
        if (schoolSectionRepository.existsBySectionNameIgnoreCase(trimmed)) {
            throw new IllegalArgumentException("Section already exists");
        }
        return schoolSectionRepository.save(new SchoolSection(trimmed));
    }

    @Transactional
    public SchoolSection updateSection(Long id, String sectionName) {
        String trimmed = normalizeName(sectionName);
        SchoolSection existing = schoolSectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        Optional<SchoolSection> duplicate = schoolSectionRepository.findBySectionNameIgnoreCase(trimmed);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("Section already exists");
        }

        existing.setSectionName(trimmed);
        return schoolSectionRepository.save(existing);
    }

    @Transactional
    public void deleteSection(Long id) {
        if (!schoolSectionRepository.existsById(id)) {
            throw new IllegalArgumentException("Section not found");
        }
        schoolSectionRepository.deleteById(id);
    }

    private String normalizeName(String sectionName) {
        String trimmed = sectionName == null ? "" : sectionName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Section name is required");
        }
        return trimmed;
    }
}
