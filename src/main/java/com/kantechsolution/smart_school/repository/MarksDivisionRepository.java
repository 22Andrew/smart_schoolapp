package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MarksDivision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarksDivisionRepository extends JpaRepository<MarksDivision, Long> {

    List<MarksDivision> findAllByOrderByPercentFromDesc();

    boolean existsByDivisionNameIgnoreCase(String divisionName);

    boolean existsByDivisionNameIgnoreCaseAndIdNot(String divisionName, Long id);
}
