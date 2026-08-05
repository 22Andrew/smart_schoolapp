package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.DisableReason;
import com.kantechsolution.smart_school.repository.DisableReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for disable reason persistence
 */
@Service
public class DisableReasonService {

    @Autowired
    private DisableReasonRepository disableReasonRepository;

    public List<DisableReason> getAllReasons() {
        return disableReasonRepository.findAllByOrderByIdAsc();
    }

    public Optional<DisableReason> getReasonById(Long id) {
        return disableReasonRepository.findById(id);
    }

    @Transactional
    public DisableReason createReason(String reason) {
        String trimmed = reason == null ? "" : reason.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Disable reason is required");
        }
        if (disableReasonRepository.existsByReasonIgnoreCase(trimmed)) {
            throw new IllegalArgumentException("Disable reason already exists");
        }
        return disableReasonRepository.save(new DisableReason(trimmed));
    }

    @Transactional
    public DisableReason updateReason(Long id, String reason) {
        String trimmed = reason == null ? "" : reason.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Disable reason is required");
        }

        DisableReason existing = disableReasonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disable reason not found"));

        Optional<DisableReason> duplicate = disableReasonRepository.findByReasonIgnoreCase(trimmed);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new IllegalArgumentException("Disable reason already exists");
        }

        existing.setReason(trimmed);
        return disableReasonRepository.save(existing);
    }

    @Transactional
    public void deleteReason(Long id) {
        if (!disableReasonRepository.existsById(id)) {
            throw new IllegalArgumentException("Disable reason not found");
        }
        disableReasonRepository.deleteById(id);
    }
}
