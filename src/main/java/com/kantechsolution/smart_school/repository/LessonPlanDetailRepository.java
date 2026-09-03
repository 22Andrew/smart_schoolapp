package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LessonPlanDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LessonPlanDetailRepository extends JpaRepository<LessonPlanDetail, Long> {

    Optional<LessonPlanDetail> findByScheduleId(Long scheduleId);
}
