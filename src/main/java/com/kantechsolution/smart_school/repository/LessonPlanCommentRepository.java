package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LessonPlanComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonPlanCommentRepository extends JpaRepository<LessonPlanComment, Long> {

    List<LessonPlanComment> findByScheduleIdOrderByCreatedAtAsc(Long scheduleId);
}
