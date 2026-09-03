package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AcademicSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicSessionRepository extends JpaRepository<AcademicSession, Long> {

    List<AcademicSession> findAllByOrderBySessionNameDesc();

    List<AcademicSession> findAllByOrderBySessionNameAsc();

    Optional<AcademicSession> findByCurrentTrue();

    Optional<AcademicSession> findBySessionNameIgnoreCase(String sessionName);
}
