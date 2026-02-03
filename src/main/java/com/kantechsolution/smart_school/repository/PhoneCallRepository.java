package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.PhoneCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for PhoneCall entity
 */
@Repository
public interface PhoneCallRepository extends JpaRepository<PhoneCall, Long> {
    
    /**
     * Find all phone calls ordered by date descending
     */
    List<PhoneCall> findAllByOrderByDateDesc();
    
    /**
     * Find phone calls by date range
     */
    List<PhoneCall> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find phone calls by call type
     */
    List<PhoneCall> findByCallTypeOrderByDateDesc(String callType);
    
    /**
     * Find phone calls by name containing
     */
    List<PhoneCall> findByNameContainingIgnoreCaseOrderByDateDesc(String name);
    
    /**
     * Find phone calls by phone number
     */
    List<PhoneCall> findByPhoneContainingOrderByDateDesc(String phone);
}
