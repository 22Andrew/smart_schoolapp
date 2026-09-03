package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CbseExamSubjectRepository extends JpaRepository<CbseExamSubject, Long> {

    List<CbseExamSubject> findByCbseExamIdOrderByIdAsc(Long cbseExamId);

    long countByCbseExamId(Long cbseExamId);
}
