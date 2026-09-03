package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ComplaintType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ComplaintType entity
 */
@Repository
public interface ComplaintTypeRepository extends JpaRepository<ComplaintType, Long> {
}
