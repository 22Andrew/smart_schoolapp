package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CbseExamGradeRepository extends JpaRepository<CbseExamGrade, Long> {

    @Query("SELECT DISTINCT g FROM CbseExamGrade g LEFT JOIN FETCH g.details ORDER BY g.gradeTitle ASC")
    List<CbseExamGrade> findAllByOrderByGradeTitleAsc();

    @Query("SELECT g FROM CbseExamGrade g LEFT JOIN FETCH g.details WHERE g.id = :id")
    Optional<CbseExamGrade> findByIdWithDetails(@Param("id") Long id);

    Optional<CbseExamGrade> findByGradeTitleIgnoreCase(String gradeTitle);

    boolean existsByGradeTitleIgnoreCase(String gradeTitle);

    boolean existsByGradeTitleIgnoreCaseAndIdNot(String gradeTitle, Long id);
}
