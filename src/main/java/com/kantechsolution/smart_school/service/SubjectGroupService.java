package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.Subject;
import com.kantechsolution.smart_school.model.SubjectGroup;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SubjectGroupRepository;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service for subject group persistence
 */
@Service
public class SubjectGroupService {

    @Autowired
    private SubjectGroupRepository subjectGroupRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public List<SubjectGroup> getAllGroups() {
        return subjectGroupRepository.findAllByOrderByIdDesc();
    }

    public Optional<SubjectGroup> getGroupById(Long id) {
        return subjectGroupRepository.findById(id);
    }

    @Transactional
    public SubjectGroup createGroup(String name, Long classId, List<String> sections, List<Long> subjectIds, String description) {
        SubjectGroup group = new SubjectGroup();
        applyFields(group, name, classId, sections, subjectIds, description);
        return subjectGroupRepository.save(group);
    }

    @Transactional
    public SubjectGroup updateGroup(Long id, String name, Long classId, List<String> sections, List<Long> subjectIds, String description) {
        SubjectGroup existing = subjectGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject group not found"));
        applyFields(existing, name, classId, sections, subjectIds, description);
        return subjectGroupRepository.save(existing);
    }

    @Transactional
    public void deleteGroup(Long id) {
        if (!subjectGroupRepository.existsById(id)) {
            throw new IllegalArgumentException("Subject group not found");
        }
        subjectGroupRepository.deleteById(id);
    }

    private void applyFields(SubjectGroup group, String name, Long classId, List<String> sections,
                             List<Long> subjectIds, String description) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));

        List<String> normalizedSections = normalizeSections(sections, schoolClass);
        Set<Subject> subjects = resolveSubjects(subjectIds);

        group.setName(trimmedName);
        group.setSchoolClass(schoolClass);
        group.setSections(normalizedSections);
        group.setSubjects(subjects);
        group.setDescription(description == null ? "" : description.trim());
    }

    private List<String> normalizeSections(List<String> sections, SchoolClass schoolClass) {
        if (sections == null || sections.isEmpty()) {
            throw new IllegalArgumentException("At least one section is required");
        }

        List<String> classSections = schoolClass.getSections() == null ? List.of() : schoolClass.getSections();
        Set<String> unique = new LinkedHashSet<>();
        for (String section : sections) {
            if (section == null) continue;
            String value = section.trim().toUpperCase();
            if (value.isEmpty()) continue;
            boolean allowed = classSections.stream().anyMatch(s -> s.equalsIgnoreCase(value));
            if (!allowed) {
                throw new IllegalArgumentException("Section " + value + " is not available for the selected class");
            }
            unique.add(value);
        }
        if (unique.isEmpty()) {
            throw new IllegalArgumentException("At least one section is required");
        }
        return new ArrayList<>(unique);
    }

    private Set<Subject> resolveSubjects(List<Long> subjectIds) {
        if (subjectIds == null || subjectIds.isEmpty()) {
            throw new IllegalArgumentException("At least one subject is required");
        }
        Set<Subject> subjects = new LinkedHashSet<>();
        for (Long subjectId : subjectIds) {
            if (subjectId == null) continue;
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));
            subjects.add(subject);
        }
        if (subjects.isEmpty()) {
            throw new IllegalArgumentException("At least one subject is required");
        }
        return subjects;
    }
}
