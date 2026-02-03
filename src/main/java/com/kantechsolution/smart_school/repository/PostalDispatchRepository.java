package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.PostalDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for PostalDispatch entity
 */
@Repository
public interface PostalDispatchRepository extends JpaRepository<PostalDispatch, Long> {
    
    /**
     * Find all postal dispatches ordered by date descending
     */
    List<PostalDispatch> findAllByOrderByDateDesc();
    
    /**
     * Find postal dispatches by date range
     */
    List<PostalDispatch> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find postal dispatches by reference number
     */
    List<PostalDispatch> findByReferenceNoContainingIgnoreCase(String referenceNo);
    
    /**
     * Find postal dispatches by to title
     */
    List<PostalDispatch> findByToTitleContainingIgnoreCase(String toTitle);
    
    /**
     * Find postal dispatches by from title
     */
    List<PostalDispatch> findByFromTitleContainingIgnoreCase(String fromTitle);
}
