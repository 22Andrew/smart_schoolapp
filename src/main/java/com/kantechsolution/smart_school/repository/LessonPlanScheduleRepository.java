package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LessonPlanSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LessonPlanScheduleRepository extends JpaRepository<LessonPlanSchedule, Long> {

    List<LessonPlanSchedule> findByTeacherCodeIgnoreCaseAndPlanDateBetweenOrderByPlanDateAscTimeFromAsc(
            String teacherCode, LocalDate startDate, LocalDate endDate);

    List<LessonPlanSchedule> findByClassNameIgnoreCaseAndSectionIgnoreCaseAndPlanDateBetweenOrderByPlanDateAscTimeFromAsc(
            String className, String section, LocalDate startDate, LocalDate endDate);

    boolean existsByClassNameIgnoreCaseAndSectionIgnoreCaseAndPlanDateBetween(
            String className, String section, LocalDate startDate, LocalDate endDate);

    boolean existsByTeacherCodeIgnoreCase(String teacherCode);
}
