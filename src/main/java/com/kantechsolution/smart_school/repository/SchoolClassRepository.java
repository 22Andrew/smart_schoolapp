package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for SchoolClass entity
 */
@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    Optional<SchoolClass> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<SchoolClass> findAllByOrderByIdAsc();
}
