package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamGroupExamTeacherRemark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamGroupExamTeacherRemarkRepository extends JpaRepository<ExamGroupExamTeacherRemark, Long> {

    List<ExamGroupExamTeacherRemark> findByExamGroupExamIdOrderByIdAsc(Long examGroupExamId);

    Optional<ExamGroupExamTeacherRemark> findByExamGroupExamIdAndStudentAdmissionId(Long examGroupExamId, Long studentAdmissionId);

    void deleteByExamGroupExamId(Long examGroupExamId);
}
