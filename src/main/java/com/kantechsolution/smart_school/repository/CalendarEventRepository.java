package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    @Query("""
            SELECT e FROM CalendarEvent e
            WHERE e.endDate >= :start AND e.startDate <= :end
            ORDER BY e.startDate ASC, e.startTime ASC, e.id ASC
            """)
    List<CalendarEvent> findInRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
