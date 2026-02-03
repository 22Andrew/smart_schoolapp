package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.PostalDispatch;
import com.kantechsolution.smart_school.repository.PostalDispatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for PostalDispatch operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostalDispatchService {
    
    private final PostalDispatchRepository postalDispatchRepository;
    
    /**
     * Save a new postal dispatch record
     */
    @Transactional
    public PostalDispatch savePostalDispatch(PostalDispatch postalDispatch) {
        log.info("Saving postal dispatch record for: {}", postalDispatch.getToTitle());
        return postalDispatchRepository.save(postalDispatch);
    }
    
    /**
     * Get all postal dispatch records
     */
    @Transactional(readOnly = true)
    public List<PostalDispatch> getAllPostalDispatches() {
        log.info("Retrieving all postal dispatch records");
        return postalDispatchRepository.findAllByOrderByDateDesc();
    }
    
    /**
     * Get postal dispatch by ID
     */
    @Transactional(readOnly = true)
    public Optional<PostalDispatch> getPostalDispatchById(Long id) {
        log.info("Retrieving postal dispatch record with ID: {}", id);
        return postalDispatchRepository.findById(id);
    }
    
    /**
     * Update an existing postal dispatch record
     */
    @Transactional
    public PostalDispatch updatePostalDispatch(Long id, PostalDispatch postalDispatch) {
        log.info("Updating postal dispatch record with ID: {}", id);
        return postalDispatchRepository.findById(id)
                .map(existing -> {
                    existing.setToTitle(postalDispatch.getToTitle());
                    existing.setReferenceNo(postalDispatch.getReferenceNo());
                    existing.setAddress(postalDispatch.getAddress());
                    existing.setNote(postalDispatch.getNote());
                    existing.setFromTitle(postalDispatch.getFromTitle());
                    existing.setDate(postalDispatch.getDate());
                    existing.setDocumentPath(postalDispatch.getDocumentPath());
                    return postalDispatchRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Postal dispatch not found with id: " + id));
    }
    
    /**
     * Delete a postal dispatch record
     */
    @Transactional
    public void deletePostalDispatch(Long id) {
        log.info("Deleting postal dispatch record with ID: {}", id);
        postalDispatchRepository.deleteById(id);
    }
    
    /**
     * Get postal dispatches by date range
     */
    @Transactional(readOnly = true)
    public List<PostalDispatch> getPostalDispatchesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Retrieving postal dispatches between {} and {}", startDate, endDate);
        return postalDispatchRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
    
    /**
     * Search postal dispatches by reference number
     */
    @Transactional(readOnly = true)
    public List<PostalDispatch> searchByReferenceNo(String referenceNo) {
        log.info("Searching postal dispatches by reference number: {}", referenceNo);
        return postalDispatchRepository.findByReferenceNoContainingIgnoreCase(referenceNo);
    }
    
    /**
     * Search postal dispatches by to title
     */
    @Transactional(readOnly = true)
    public List<PostalDispatch> searchByToTitle(String toTitle) {
        log.info("Searching postal dispatches by to title: {}", toTitle);
        return postalDispatchRepository.findByToTitleContainingIgnoreCase(toTitle);
    }
    
    /**
     * Search postal dispatches by from title
     */
    @Transactional(readOnly = true)
    public List<PostalDispatch> searchByFromTitle(String fromTitle) {
        log.info("Searching postal dispatches by from title: {}", fromTitle);
        return postalDispatchRepository.findByFromTitleContainingIgnoreCase(fromTitle);
    }
}
