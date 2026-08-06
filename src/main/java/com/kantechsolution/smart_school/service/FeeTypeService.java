package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeType;
import com.kantechsolution.smart_school.repository.FeeTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class FeeTypeService {

    @Autowired
    private FeeTypeRepository feeTypeRepository;

    public List<FeeType> getAllTypes() {
        return feeTypeRepository.findAllByOrderByIdAsc();
    }

    public Optional<FeeType> getTypeById(Long id) {
        return feeTypeRepository.findById(id);
    }

    @Transactional
    public FeeType createType(String name, String feesCode, String description) {
        String trimmedName = required(name, "Fees type name is required");
        String trimmedCode = normalizeCode(feesCode);

        if (feeTypeRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Fees type name already exists");
        }
        if (feeTypeRepository.existsByFeesCodeIgnoreCase(trimmedCode)) {
            throw new IllegalArgumentException("Fees code already exists");
        }

        String trimmedDescription = description == null ? "" : description.trim();
        return feeTypeRepository.save(new FeeType(trimmedName, trimmedCode, trimmedDescription));
    }

    @Transactional
    public FeeType updateType(Long id, String name, String feesCode, String description) {
        String trimmedName = required(name, "Fees type name is required");
        String trimmedCode = normalizeCode(feesCode);

        FeeType existing = feeTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fees type not found"));

        Optional<FeeType> duplicateName = feeTypeRepository.findByNameIgnoreCase(trimmedName);
        if (duplicateName.isPresent() && !duplicateName.get().getId().equals(id)) {
            throw new IllegalArgumentException("Fees type name already exists");
        }

        Optional<FeeType> duplicateCode = feeTypeRepository.findByFeesCodeIgnoreCase(trimmedCode);
        if (duplicateCode.isPresent() && !duplicateCode.get().getId().equals(id)) {
            throw new IllegalArgumentException("Fees code already exists");
        }

        existing.setName(trimmedName);
        existing.setFeesCode(trimmedCode);
        existing.setDescription(description == null ? "" : description.trim());
        return feeTypeRepository.save(existing);
    }

    @Transactional
    public void deleteType(Long id) {
        if (!feeTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Fees type not found");
        }
        feeTypeRepository.deleteById(id);
    }

    private String required(String value, String message) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return trimmed;
    }

    private String normalizeCode(String feesCode) {
        String trimmed = required(feesCode, "Fees code is required");
        return trimmed.toLowerCase(Locale.ROOT).replace(' ', '-');
    }
}
