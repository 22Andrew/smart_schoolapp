package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AdmissionEnquiry;
import com.kantechsolution.smart_school.repository.AdmissionEnquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for AdmissionEnquiry business logic
 */
@Service
@RequiredArgsConstructor
public class AdmissionEnquiryService {
    
    private final AdmissionEnquiryRepository repository;
    
    /**
     * Save a new admission enquiry
     */
    @Transactional
    public AdmissionEnquiry saveEnquiry(AdmissionEnquiry enquiry) {
        // Set default status if not provided
        if (enquiry.getStatus() == null) {
            enquiry.setStatus(AdmissionEnquiry.EnquiryStatus.ACTIVE);
        }
        // Set default isActive if not provided
        if (enquiry.getIsActive() == null) {
            enquiry.setIsActive(true);
        }
        return repository.save(enquiry);
    }
    
    /**
     * Get all admission enquiries
     */
    public List<AdmissionEnquiry> getAllEnquiries() {
        return repository.findAll();
    }
    
    /**
     * Get enquiry by ID
     */
    public Optional<AdmissionEnquiry> getEnquiryById(Long id) {
        return repository.findById(id);
    }
    
    /**
     * Update an existing enquiry
     */
    @Transactional
    public AdmissionEnquiry updateEnquiry(Long id, AdmissionEnquiry enquiryDetails) {
        AdmissionEnquiry enquiry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found with id: " + id));
        
        enquiry.setName(enquiryDetails.getName());
        enquiry.setPhone(enquiryDetails.getPhone());
        enquiry.setEmail(enquiryDetails.getEmail());
        enquiry.setAddress(enquiryDetails.getAddress());
        enquiry.setDescription(enquiryDetails.getDescription());
        enquiry.setNote(enquiryDetails.getNote());
        enquiry.setDate(enquiryDetails.getDate());
        enquiry.setFollowUpDate(enquiryDetails.getFollowUpDate());
        enquiry.setAssigned(enquiryDetails.getAssigned());
        enquiry.setReference(enquiryDetails.getReference());
        enquiry.setSource(enquiryDetails.getSource());
        enquiry.setClassName(enquiryDetails.getClassName());
        enquiry.setChildCount(enquiryDetails.getChildCount());
        enquiry.setStatus(enquiryDetails.getStatus());
        
        return repository.save(enquiry);
    }
    
    /**
     * Delete an enquiry
     */
    @Transactional
    public void deleteEnquiry(Long id) {
        repository.deleteById(id);
    }
    
    /**
     * Get enquiries by status
     */
    public List<AdmissionEnquiry> getEnquiriesByStatus(AdmissionEnquiry.EnquiryStatus status) {
        return repository.findByStatus(status);
    }
    
    /**
     * Get enquiries by date range
     */
    public List<AdmissionEnquiry> getEnquiriesByDateRange(LocalDate startDate, LocalDate endDate) {
        return repository.findByDateBetween(startDate, endDate);
    }
    
    /**
     * Get enquiries by source
     */
    public List<AdmissionEnquiry> getEnquiriesBySource(String source) {
        return repository.findBySource(source);
    }
    
    /**
     * Get enquiries by class
     */
    public List<AdmissionEnquiry> getEnquiriesByClass(String className) {
        return repository.findByClassName(className);
    }
    
    /**
     * Get active enquiries only
     */
    public List<AdmissionEnquiry> getActiveEnquiries() {
        return repository.findByIsActiveTrue();
    }
}
