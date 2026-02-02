package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AdmissionEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for AdmissionEnquiry entity
 */
@Repository
public interface AdmissionEnquiryRepository extends JpaRepository<AdmissionEnquiry, Long> {
    
    /**
     * Find enquiries by status
     */
    List<AdmissionEnquiry> findByStatus(AdmissionEnquiry.EnquiryStatus status);
    
    /**
     * Find enquiries by date range
     */
    List<AdmissionEnquiry> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find enquiries by source
     */
    List<AdmissionEnquiry> findBySource(String source);
    
    /**
     * Find enquiries by class name
     */
    List<AdmissionEnquiry> findByClassName(String className);
    
    /**
     * Find active enquiries
     */
    List<AdmissionEnquiry> findByIsActiveTrue();
    
    /**
     * Find enquiries by assigned person
     */
    List<AdmissionEnquiry> findByAssigned(String assigned);
}
