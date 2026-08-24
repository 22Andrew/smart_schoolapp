package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {

    List<AuditTrail> findAllByOrderByEventDateTimeDesc();
}
