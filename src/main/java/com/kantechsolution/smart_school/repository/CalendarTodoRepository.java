package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CalendarTodo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CalendarTodoRepository extends JpaRepository<CalendarTodo, Long> {

    Page<CalendarTodo> findAllByOrderByDueDateAscIdAsc(Pageable pageable);

    List<CalendarTodo> findByDueDateBetweenOrderByDueDateAscIdAsc(LocalDate start, LocalDate end);

    long countByCompletedFalseAndDueDateLessThanEqual(LocalDate dueDate);
}
