package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.IncomeHead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncomeHeadRepository extends JpaRepository<IncomeHead, Long> {
    List<IncomeHead> findAllByOrderByNameAsc();

    Optional<IncomeHead> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
