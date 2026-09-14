package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamGroupLinkedExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamGroupLinkedExamRepository extends JpaRepository<ExamGroupLinkedExam, Long> {

    @Query("SELECT l FROM ExamGroupLinkedExam l WHERE l.examGroupExam.examGroup.id = :groupId ORDER BY l.id ASC")
    List<ExamGroupLinkedExam> findByExamGroupId(@Param("groupId") Long groupId);

    void deleteByExamGroupExamId(Long examGroupExamId);
}
