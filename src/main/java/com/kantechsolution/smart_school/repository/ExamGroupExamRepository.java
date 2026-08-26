package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamGroupExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamGroupExamRepository extends JpaRepository<ExamGroupExam, Long> {

    long countByExamGroupId(Long examGroupId);

    @Query("SELECT e FROM ExamGroupExam e WHERE e.examGroup.id = :groupId ORDER BY e.name ASC, e.id ASC")
    List<ExamGroupExam> findByExamGroupIdOrderByIdAsc(@Param("groupId") Long groupId);

    @Query("SELECT e FROM ExamGroupExam e WHERE e.id = :examId AND e.examGroup.id = :groupId")
    Optional<ExamGroupExam> findByIdAndExamGroupId(@Param("examId") Long examId, @Param("groupId") Long groupId);

    Optional<ExamGroupExam> findByNameIgnoreCase(String name);
}
