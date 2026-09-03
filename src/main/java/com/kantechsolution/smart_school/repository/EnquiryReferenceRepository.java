package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.EnquiryReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for EnquiryReference entity
 */
@Repository
public interface EnquiryReferenceRepository extends JpaRepository<EnquiryReference, Long> {
}
