package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ClassTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ClassTimetable periods
 */
@Repository
public interface ClassTimetableRepository extends JpaRepository<ClassTimetable, Long> {

    List<ClassTimetable> findBySchoolClassIdAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
            Long schoolClassId, String section);

    List<ClassTimetable> findByTeacherCodeOrderByDayOfWeekAscStartTimeAsc(String teacherCode);

    void deleteBySchoolClassIdAndSectionIgnoreCase(Long schoolClassId, String section);
}
