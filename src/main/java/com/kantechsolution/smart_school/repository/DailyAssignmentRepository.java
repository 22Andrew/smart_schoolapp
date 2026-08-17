package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.DailyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyAssignmentRepository extends JpaRepository<DailyAssignment, Long> {

    List<DailyAssignment> findByIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc();

    @Query("""
            SELECT d FROM DailyAssignment d
            WHERE d.isActive = true
              AND d.classId = :classId
              AND d.section = :section
              AND d.subjectGroupId = :subjectGroupId
              AND d.subjectId = :subjectId
              AND d.assignmentDate = :assignmentDate
            ORDER BY d.studentName ASC, d.createdAt DESC
            """)
    List<DailyAssignment> searchAssignments(
            @Param("classId") Long classId,
            @Param("section") String section,
            @Param("subjectGroupId") Long subjectGroupId,
            @Param("subjectId") Long subjectId,
            @Param("assignmentDate") LocalDate assignmentDate);
}
