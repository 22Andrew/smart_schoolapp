package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.PostalReceive;
import com.kantechsolution.smart_school.repository.PostalReceiveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for PostalReceive operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostalReceiveService {
    
    private final PostalReceiveRepository postalReceiveRepository;
    
    /**
     * Save a new postal receive record
     */
    @Transactional
    public PostalReceive savePostalReceive(PostalReceive postalReceive) {
        log.info("Saving postal receive record from: {}", postalReceive.getFromTitle());
        return postalReceiveRepository.save(postalReceive);
    }
    
    /**
     * Get all postal receive records
     */
    @Transactional(readOnly = true)
    public List<PostalReceive> getAllPostalReceives() {
        log.info("Retrieving all postal receive records");
        return postalReceiveRepository.findAllByOrderByDateDesc();
    }
    
    /**
     * Get postal receive by ID
     */
    @Transactional(readOnly = true)
    public Optional<PostalReceive> getPostalReceiveById(Long id) {
        log.info("Retrieving postal receive record with ID: {}", id);
        return postalReceiveRepository.findById(id);
    }
    
    /**
     * Update an existing postal receive record
     */
    @Transactional
    public PostalReceive updatePostalReceive(Long id, PostalReceive postalReceive) {
        log.info("Updating postal receive record with ID: {}", id);
        return postalReceiveRepository.findById(id)
                .map(existing -> {
                    existing.setFromTitle(postalReceive.getFromTitle());
                    existing.setReferenceNo(postalReceive.getReferenceNo());
                    existing.setAddress(postalReceive.getAddress());
                    existing.setNote(postalReceive.getNote());
                    existing.setToTitle(postalReceive.getToTitle());
                    existing.setDate(postalReceive.getDate());
                    existing.setDocumentPath(postalReceive.getDocumentPath());
                    return postalReceiveRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Postal receive not found with id: " + id));
    }
    
    /**
     * Delete a postal receive record
     */
    @Transactional
    public void deletePostalReceive(Long id) {
        log.info("Deleting postal receive record with ID: {}", id);
        postalReceiveRepository.deleteById(id);
    }
    
    /**
     * Get postal receives by date range
     */
    @Transactional(readOnly = true)
    public List<PostalReceive> getPostalReceivesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Retrieving postal receives between {} and {}", startDate, endDate);
        return postalReceiveRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
    
    /**
     * Search postal receives by reference number
     */
    @Transactional(readOnly = true)
    public List<PostalReceive> searchByReferenceNo(String referenceNo) {
        log.info("Searching postal receives by reference number: {}", referenceNo);
        return postalReceiveRepository.findByReferenceNoContainingIgnoreCase(referenceNo);
    }
    
    /**
     * Search postal receives by from title
     */
    @Transactional(readOnly = true)
    public List<PostalReceive> searchByFromTitle(String fromTitle) {
        log.info("Searching postal receives by from title: {}", fromTitle);
        return postalReceiveRepository.findByFromTitleContainingIgnoreCase(fromTitle);
    }
    
    /**
     * Search postal receives by to title
     */
    @Transactional(readOnly = true)
    public List<PostalReceive> searchByToTitle(String toTitle) {
        log.info("Searching postal receives by to title: {}", toTitle);
        return postalReceiveRepository.findByToTitleContainingIgnoreCase(toTitle);
    }
}
