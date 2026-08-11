package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CbseExamRankRepository extends JpaRepository<CbseExamRank, Long> {

    @Query("SELECT r FROM CbseExamRank r WHERE r.cbseExam.id = :examId ORDER BY r.studentRank ASC")
    List<CbseExamRank> findByCbseExamIdOrderByStudentRankAsc(@Param("examId") Long examId);

    @Modifying
    @Query("DELETE FROM CbseExamRank r WHERE r.cbseExam.id = :examId")
    void deleteByCbseExamId(@Param("examId") Long examId);
}
