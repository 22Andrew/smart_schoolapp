package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.HomeworkStudentEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HomeworkStudentEvaluationRepository extends JpaRepository<HomeworkStudentEvaluation, Long> {

    List<HomeworkStudentEvaluation> findByHomeworkIdAndIsActiveTrueOrderByStudentNameAsc(Long homeworkId);

    Optional<HomeworkStudentEvaluation> findByHomeworkIdAndStudentAdmissionIdAndIsActiveTrue(
            Long homeworkId, Long studentAdmissionId);
}
