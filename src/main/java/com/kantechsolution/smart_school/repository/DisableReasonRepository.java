package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.DisableReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for DisableReason entity
 */
@Repository
public interface DisableReasonRepository extends JpaRepository<DisableReason, Long> {

    Optional<DisableReason> findByReasonIgnoreCase(String reason);

    boolean existsByReasonIgnoreCase(String reason);

    List<DisableReason> findAllByOrderByIdAsc();
}
