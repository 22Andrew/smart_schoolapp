package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamGroupExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamGroupExamStudentRepository extends JpaRepository<ExamGroupExamStudent, Long> {

    List<ExamGroupExamStudent> findByExamGroupExamIdOrderByIdAsc(Long examGroupExamId);

    void deleteByExamGroupExamId(Long examGroupExamId);
}
