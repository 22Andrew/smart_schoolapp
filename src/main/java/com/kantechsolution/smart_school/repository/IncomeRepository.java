package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findAllByOrderByDateDescIdDesc();

    List<Income> findByDateBetweenOrderByDateDescIdDesc(LocalDate startDate, LocalDate endDate);
}
