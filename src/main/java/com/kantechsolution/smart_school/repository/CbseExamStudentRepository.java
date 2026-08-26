package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CbseExamStudentRepository extends JpaRepository<CbseExamStudent, Long> {

    List<CbseExamStudent> findByCbseExamIdOrderByIdAsc(Long cbseExamId);

    void deleteByCbseExamIdAndStudentAdmissionId(Long cbseExamId, Long studentAdmissionId);

    @Query("""
            SELECT es FROM CbseExamStudent es
            JOIN FETCH es.cbseExam e
            WHERE es.studentAdmissionId = :studentId AND e.publishResult = true
            ORDER BY e.createdAt DESC, e.id DESC
            """)
    List<CbseExamStudent> findPublishedAssignmentsForStudent(@Param("studentId") Long studentId);
}
