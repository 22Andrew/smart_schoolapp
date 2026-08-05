package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Subject entity
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    Optional<Subject> findBySubjectCodeIgnoreCase(String subjectCode);

    boolean existsBySubjectCodeIgnoreCase(String subjectCode);

    List<Subject> findAllByOrderByIdAsc();
}
