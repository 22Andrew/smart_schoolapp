package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamGroupRepository extends JpaRepository<ExamGroup, Long> {

    List<ExamGroup> findAllByOrderByNameAsc();

    Optional<ExamGroup> findByNameIgnoreCase(String name);
}
