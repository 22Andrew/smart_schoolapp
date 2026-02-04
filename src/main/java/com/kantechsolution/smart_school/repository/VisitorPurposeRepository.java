package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.VisitorPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for VisitorPurpose entity
 */
@Repository
public interface VisitorPurposeRepository extends JpaRepository<VisitorPurpose, Long> {
}
