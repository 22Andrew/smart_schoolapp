package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LessonPlanLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonPlanLessonRepository extends JpaRepository<LessonPlanLesson, Long> {

    List<LessonPlanLesson> findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc();

    List<LessonPlanLesson> findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
            Long classId, String section, Long subjectGroupId, Long subjectId);

    List<LessonPlanLesson> findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdOrderBySubjectNameAscLessonNameAsc(
            Long classId, String section, Long subjectGroupId);

    List<LessonPlanLesson> findByClassIdAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(
            Long classId, String section);

    List<LessonPlanLesson> findByClassNameIgnoreCaseAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(
            String className, String section);

    List<LessonPlanLesson> findByAcademicSessionIgnoreCaseAndClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
            String academicSession, Long classId, String section, Long subjectGroupId, Long subjectId);
}
