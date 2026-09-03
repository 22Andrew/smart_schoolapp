package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolHouse;
import com.kantechsolution.smart_school.repository.SchoolHouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for school house persistence
 */
@Service
public class SchoolHouseService {

    @Autowired
    private SchoolHouseRepository schoolHouseRepository;

    public List<SchoolHouse> getAllHouses() {
        return schoolHouseRepository.findAllByOrderByIdAsc();
    }

    public Optional<SchoolHouse> getHouseById(Long id) {
        return schoolHouseRepository.findById(id);
    }

    @Transactional
    public SchoolHouse createHouse(String name, String description) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("House name is required");
        }
        if (schoolHouseRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("School house already exists");
        }
        String trimmedDescription = description == null ? "" : description.trim();
        return schoolHouseRepository.save(new SchoolHouse(trimmedName, trimmedDescription));
    }

    @Transactional
    public SchoolHouse updateHouse(Long id, String name, String description) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("House name is required");
        }

        SchoolHouse existing = schoolHouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School house not found"));

        Optional<SchoolHouse> duplicate = schoolHouseRepository.findByNameIgnoreCase(trimmedName);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("School house already exists");
        }

        existing.setName(trimmedName);
        existing.setDescription(description == null ? "" : description.trim());
        return schoolHouseRepository.save(existing);
    }

    @Transactional
    public void deleteHouse(Long id) {
        if (!schoolHouseRepository.existsById(id)) {
            throw new IllegalArgumentException("School house not found");
        }
        schoolHouseRepository.deleteById(id);
    }
}
