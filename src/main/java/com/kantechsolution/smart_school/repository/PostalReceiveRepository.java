package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.PostalReceive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for PostalReceive entity
 */
@Repository
public interface PostalReceiveRepository extends JpaRepository<PostalReceive, Long> {
    
    /**
     * Find all postal receives ordered by date descending
     */
    List<PostalReceive> findAllByOrderByDateDesc();
    
    /**
     * Find postal receives by date range
     */
    List<PostalReceive> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find postal receives by reference number
     */
    List<PostalReceive> findByReferenceNoContainingIgnoreCase(String referenceNo);
    
    /**
     * Find postal receives by from title
     */
    List<PostalReceive> findByFromTitleContainingIgnoreCase(String fromTitle);
    
    /**
     * Find postal receives by to title
     */
    List<PostalReceive> findByToTitleContainingIgnoreCase(String toTitle);
}
