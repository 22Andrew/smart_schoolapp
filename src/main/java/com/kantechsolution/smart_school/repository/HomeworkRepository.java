package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {

    List<Homework> findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc();

    @Query("""
            SELECT h FROM Homework h
            WHERE h.isActive = true
              AND (:classId IS NULL OR h.classId = :classId)
              AND (:section IS NULL OR :section = '' OR h.section = :section)
              AND (:subjectGroupId IS NULL OR h.subjectGroupId = :subjectGroupId)
              AND (:subjectId IS NULL OR h.subjectId = :subjectId)
              AND (:tab = 'all'
                   OR (:tab = 'upcoming' AND h.submissionDate >= :today)
                   OR (:tab = 'closed' AND h.submissionDate < :today))
            ORDER BY h.homeworkDate DESC, h.createdAt DESC
            """)
    List<Homework> searchHomework(
            @Param("classId") Long classId,
            @Param("section") String section,
            @Param("subjectGroupId") Long subjectGroupId,
            @Param("subjectId") Long subjectId,
            @Param("tab") String tab,
            @Param("today") LocalDate today);

    boolean existsByClassNameIgnoreCaseAndSectionIgnoreCaseAndIsActiveTrue(String className, String section);
}
