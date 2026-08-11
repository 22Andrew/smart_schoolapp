package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MarksGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarksGradeRepository extends JpaRepository<MarksGrade, Long> {

    List<MarksGrade> findAllByOrderByExamTypeAscPercentFromAsc();

    boolean existsByExamTypeIgnoreCaseAndGradeNameIgnoreCase(String examType, String gradeName);

    boolean existsByExamTypeIgnoreCaseAndGradeNameIgnoreCaseAndIdNot(String examType, String gradeName, Long id);
}
