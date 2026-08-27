package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamStudentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CbseExamStudentMarkRepository extends JpaRepository<CbseExamStudentMark, Long> {

    @Query("""
            SELECT m FROM CbseExamStudentMark m
            WHERE m.cbseExam.id = :examId AND m.studentAdmissionId = :studentId
            ORDER BY m.subjectName ASC, m.assessmentOrder ASC, m.id ASC
            """)
    List<CbseExamStudentMark> findByExamAndStudent(
            @Param("examId") Long examId,
            @Param("studentId") Long studentId
    );

    @Query("""
            SELECT m FROM CbseExamStudentMark m
            WHERE m.cbseExam.id = :examId
            ORDER BY m.studentAdmissionId ASC, m.subjectName ASC, m.assessmentOrder ASC
            """)
    List<CbseExamStudentMark> findByCbseExamId(@Param("examId") Long examId);

    boolean existsByCbseExamId(Long examId);

    boolean existsByCbseExam_IdAndStudentAdmissionId(Long examId, Long studentAdmissionId);

    void deleteByCbseExamId(Long cbseExamId);
}
