package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamResultRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamResultRecordRepository extends JpaRepository<ExamResultRecord, Long> {

    @Query("""
            SELECT r FROM ExamResultRecord r
            JOIN FETCH r.studentAdmission s
            JOIN FETCH r.subjectMarks
            WHERE r.examGroupExam.id = :examId
              AND r.sessionYear = :sessionYear
              AND s.schoolClass.id = :classId
              AND s.section = :section
            ORDER BY r.studentRank ASC, s.admissionNo ASC
            """)
    List<ExamResultRecord> searchResults(
            @Param("examId") Long examId,
            @Param("sessionYear") String sessionYear,
            @Param("classId") Long classId,
            @Param("section") String section);

    long countByExamGroupExamId(Long examGroupExamId);

    @Query("""
            SELECT r FROM ExamResultRecord r
            JOIN FETCH r.studentAdmission s
            LEFT JOIN FETCH s.schoolClass
            WHERE r.examGroupExam.id = :examId
            ORDER BY r.studentRank ASC, s.admissionNo ASC
            """)
    List<ExamResultRecord> findByExamGroupExamIdOrderByStudentRankAsc(@Param("examId") Long examGroupExamId);

    Optional<ExamResultRecord> findByExamGroupExamIdAndStudentAdmissionId(Long examGroupExamId, Long studentAdmissionId);
}
