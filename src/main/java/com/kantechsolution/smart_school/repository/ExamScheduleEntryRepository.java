package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ExamScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamScheduleEntryRepository extends JpaRepository<ExamScheduleEntry, Long> {

    List<ExamScheduleEntry> findByExamGroupExamIdOrderByIdAsc(Long examGroupExamId);

    long countByExamGroupExamId(Long examGroupExamId);
}
