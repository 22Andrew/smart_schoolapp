package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for SchoolSection entity
 */
@Repository
public interface SchoolSectionRepository extends JpaRepository<SchoolSection, Long> {

    Optional<SchoolSection> findBySectionNameIgnoreCase(String sectionName);

    boolean existsBySectionNameIgnoreCase(String sectionName);

    List<SchoolSection> findAllByOrderByIdAsc();
}
