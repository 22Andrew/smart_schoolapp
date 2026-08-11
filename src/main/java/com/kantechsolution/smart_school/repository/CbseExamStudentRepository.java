package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CbseExamStudentRepository extends JpaRepository<CbseExamStudent, Long> {

    List<CbseExamStudent> findByCbseExamIdOrderByIdAsc(Long cbseExamId);

    void deleteByCbseExamIdAndStudentAdmissionId(Long cbseExamId, Long studentAdmissionId);
}
