package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Visitor entity
 */
@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    
    /**
     * Find visitors by date
     */
    List<Visitor> findByDate(LocalDate date);
    
    /**
     * Find visitors by date range
     */
    List<Visitor> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find visitors by purpose
     */
    List<Visitor> findByPurposeContainingIgnoreCase(String purpose);
    
    /**
     * Find visitors by name
     */
    List<Visitor> findByVisitorNameContainingIgnoreCase(String visitorName);
    
    /**
     * Find all visitors ordered by date and in time descending
     */
    List<Visitor> findAllByOrderByDateDescInTimeDesc();
}
