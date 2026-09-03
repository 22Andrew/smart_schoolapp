package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByOrderByDateDescIdDesc();

    List<Expense> findByDateBetweenOrderByDateDescIdDesc(LocalDate startDate, LocalDate endDate);
}
