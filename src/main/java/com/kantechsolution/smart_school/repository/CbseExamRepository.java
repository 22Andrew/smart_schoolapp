package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CbseExamRepository extends JpaRepository<CbseExam, Long> {

    List<CbseExam> findAllByOrderByCreatedAtDescIdDesc();
}
