package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Subject;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for subject persistence
 */
@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAllByOrderByIdAsc();
    }

    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }

    @Transactional
    public Subject createSubject(String name, String subjectCode, String subjectType) {
        String trimmedName = normalizeName(name);
        String trimmedCode = normalizeCode(subjectCode);
        Subject.SubjectType type = normalizeType(subjectType);

        if (subjectRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Subject name already exists");
        }
        if (trimmedCode != null && subjectRepository.existsBySubjectCodeIgnoreCase(trimmedCode)) {
            throw new IllegalArgumentException("Subject code already exists");
        }

        Subject subject = Subject.builder()
                .name(trimmedName)
                .subjectCode(trimmedCode)
                .subjectType(type)
                .build();
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(Long id, String name, String subjectCode, String subjectType) {
        String trimmedName = normalizeName(name);
        String trimmedCode = normalizeCode(subjectCode);
        Subject.SubjectType type = normalizeType(subjectType);

        Subject existing = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        Optional<Subject> duplicateName = subjectRepository.findByNameIgnoreCase(trimmedName);
        if (duplicateName.isPresent() && !duplicateName.get().getId().equals(id)) {
            throw new IllegalArgumentException("Subject name already exists");
        }

        if (trimmedCode != null) {
            Optional<Subject> duplicateCode = subjectRepository.findBySubjectCodeIgnoreCase(trimmedCode);
            if (duplicateCode.isPresent() && !duplicateCode.get().getId().equals(id)) {
                throw new IllegalArgumentException("Subject code already exists");
            }
        }

        existing.setName(trimmedName);
        existing.setSubjectCode(trimmedCode);
        existing.setSubjectType(type);
        return subjectRepository.save(existing);
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Subject not found");
        }
        subjectRepository.deleteById(id);
    }

    private String normalizeName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Subject name is required");
        }
        return trimmed;
    }

    private String normalizeCode(String subjectCode) {
        if (subjectCode == null) {
            return null;
        }
        String trimmed = subjectCode.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Subject.SubjectType normalizeType(String subjectType) {
        if (subjectType == null || subjectType.trim().isEmpty()) {
            throw new IllegalArgumentException("Subject type is required");
        }
        try {
            return Subject.SubjectType.valueOf(subjectType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Subject type must be Theory or Practical");
        }
    }
}
