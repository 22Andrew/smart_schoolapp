package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeGroup;
import com.kantechsolution.smart_school.repository.FeeGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FeeGroupService {

    @Autowired
    private FeeGroupRepository feeGroupRepository;

    public List<FeeGroup> getAllGroups() {
        return feeGroupRepository.findAllByOrderByIdAsc();
    }

    public Optional<FeeGroup> getGroupById(Long id) {
        return feeGroupRepository.findById(id);
    }

    @Transactional
    public FeeGroup createGroup(String name, String description) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Fees group name is required");
        }
        if (feeGroupRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Fees group already exists");
        }
        String trimmedDescription = description == null ? "" : description.trim();
        return feeGroupRepository.save(new FeeGroup(trimmedName, trimmedDescription));
    }

    @Transactional
    public FeeGroup updateGroup(Long id, String name, String description) {
        String trimmedName = name == null ? "" : name.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Fees group name is required");
        }

        FeeGroup existing = feeGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fees group not found"));

        Optional<FeeGroup> duplicate = feeGroupRepository.findByNameIgnoreCase(trimmedName);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("Fees group already exists");
        }

        existing.setName(trimmedName);
        existing.setDescription(description == null ? "" : description.trim());
        return feeGroupRepository.save(existing);
    }

    @Transactional
    public void deleteGroup(Long id) {
        if (!feeGroupRepository.existsById(id)) {
            throw new IllegalArgumentException("Fees group not found");
        }
        feeGroupRepository.deleteById(id);
    }
}
