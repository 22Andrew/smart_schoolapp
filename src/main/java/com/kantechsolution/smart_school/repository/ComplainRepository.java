package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Complain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Complain entity
 */
@Repository
public interface ComplainRepository extends JpaRepository<Complain, Long> {
    
    /**
     * Find all complains ordered by date descending
     */
    List<Complain> findAllByOrderByDateDesc();
    
    /**
     * Find complains by date range
     */
    List<Complain> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find complains by type
     */
    List<Complain> findByComplainTypeOrderByDateDesc(String complainType);
    
    /**
     * Find complains by name containing
     */
    List<Complain> findByComplainByContainingIgnoreCaseOrderByDateDesc(String complainBy);
    
    /**
     * Find complains by phone number
     */
    List<Complain> findByPhoneContainingOrderByDateDesc(String phone);
    
    /**
     * Find complains by source
     */
    List<Complain> findBySourceOrderByDateDesc(String source);
}
