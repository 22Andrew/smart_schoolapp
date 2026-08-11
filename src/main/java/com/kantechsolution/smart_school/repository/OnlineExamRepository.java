package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OnlineExamRepository extends JpaRepository<OnlineExam, Long> {

    List<OnlineExam> findByExamToGreaterThanEqualOrderByExamFromAsc(LocalDateTime now);

    List<OnlineExam> findByExamToLessThanOrderByExamToDesc(LocalDateTime now);
}
