package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExpenseHead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseHeadRepository extends JpaRepository<ExpenseHead, Long> {
    List<ExpenseHead> findAllByOrderByNameAsc();

    Optional<ExpenseHead> findByNameIgnoreCase(String name);
}
