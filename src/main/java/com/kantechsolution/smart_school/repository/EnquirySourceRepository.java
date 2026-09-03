package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.EnquirySource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for EnquirySource entity
 */
@Repository
public interface EnquirySourceRepository extends JpaRepository<EnquirySource, Long> {
}
