package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {

    List<Designation> findAllByOrderByNameAsc();

    Optional<Designation> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
