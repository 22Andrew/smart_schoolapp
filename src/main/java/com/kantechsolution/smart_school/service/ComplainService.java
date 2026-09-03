package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Complain;
import com.kantechsolution.smart_school.repository.ComplainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Complain operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplainService {
    
    private final ComplainRepository complainRepository;
    
    /**
     * Save a new complain record
     */
    @Transactional
    public Complain saveComplain(Complain complain) {
        log.info("Saving complain record for: {}", complain.getComplainBy());
        return complainRepository.save(complain);
    }
    
    /**
     * Get all complain records
     */
    @Transactional(readOnly = true)
    public List<Complain> getAllComplains() {
        log.info("Retrieving all complain records");
        return complainRepository.findAllByOrderByDateDesc();
    }
    
    /**
     * Get complain by ID
     */
    @Transactional(readOnly = true)
    public Optional<Complain> getComplainById(Long id) {
        log.info("Retrieving complain record with ID: {}", id);
        return complainRepository.findById(id);
    }
    
    /**
     * Update an existing complain record
     */
    @Transactional
    public Complain updateComplain(Long id, Complain complainDetails) {
        log.info("Updating complain record with ID: {}", id);
        
        Complain complain = complainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complain record not found with ID: " + id));
        
        complain.setComplainType(complainDetails.getComplainType());
        complain.setSource(complainDetails.getSource());
        complain.setComplainBy(complainDetails.getComplainBy());
        complain.setPhone(complainDetails.getPhone());
        complain.setDate(complainDetails.getDate());
        complain.setDescription(complainDetails.getDescription());
        complain.setActionTaken(complainDetails.getActionTaken());
        complain.setAssigned(complainDetails.getAssigned());
        complain.setNote(complainDetails.getNote());
        complain.setDocumentPath(complainDetails.getDocumentPath());
        
        return complainRepository.save(complain);
    }
    
    /**
     * Delete a complain record
     */
    @Transactional
    public void deleteComplain(Long id) {
        log.info("Deleting complain record with ID: {}", id);
        complainRepository.deleteById(id);
    }
    
    /**
     * Get complains by date range
     */
    @Transactional(readOnly = true)
    public List<Complain> getComplainsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Retrieving complains between {} and {}", startDate, endDate);
        return complainRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
    
    /**
     * Get complains by type
     */
    @Transactional(readOnly = true)
    public List<Complain> getComplainsByType(String complainType) {
        log.info("Retrieving complains of type: {}", complainType);
        return complainRepository.findByComplainTypeOrderByDateDesc(complainType);
    }
    
    /**
     * Search complains by name
     */
    @Transactional(readOnly = true)
    public List<Complain> searchComplainsByName(String name) {
        log.info("Searching complains by name: {}", name);
        return complainRepository.findByComplainByContainingIgnoreCaseOrderByDateDesc(name);
    }
    
    /**
     * Search complains by phone
     */
    @Transactional(readOnly = true)
    public List<Complain> searchComplainsByPhone(String phone) {
        log.info("Searching complains by phone: {}", phone);
        return complainRepository.findByPhoneContainingOrderByDateDesc(phone);
    }
    
    /**
     * Get complains by source
     */
    @Transactional(readOnly = true)
    public List<Complain> getComplainsBySource(String source) {
        log.info("Retrieving complains from source: {}", source);
        return complainRepository.findBySourceOrderByDateDesc(source);
    }
}
