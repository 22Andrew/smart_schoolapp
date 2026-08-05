package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SubjectGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for SubjectGroup entity
 */
@Repository
public interface SubjectGroupRepository extends JpaRepository<SubjectGroup, Long> {

    List<SubjectGroup> findAllByOrderByIdDesc();

    boolean existsByNameIgnoreCase(String name);
}
