package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourse;
import com.kantechsolution.smart_school.model.OnlineCourseStudentProgress;
import com.kantechsolution.smart_school.repository.OnlineCourseRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseStudentProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentCourseProgressSeedService {

    private static final Map<String, int[]> PROGRESS_BY_TITLE = Map.of(
            "Basic Computer Course for Beginners", new int[]{57, 2, 0},
            "Online Course", new int[]{100, 2, 1},
            "Basic English Speaking Course", new int[]{0, 2, 0},
            "English Course for Beginners", new int[]{80, 2, 0}
    );

    private final OnlineCourseStudentProgressRepository progressRepository;
    private final OnlineCourseRepository courseRepository;

    @Transactional
    public void seedIfEmpty(Long studentAdmissionId) {
        if (studentAdmissionId == null) {
            return;
        }
        if (progressRepository.countByStudentAdmissionId(studentAdmissionId) > 0) {
            return;
        }

        List<OnlineCourse> courses = courseRepository.findAllByOrderByIdDesc();
        for (OnlineCourse course : courses) {
            int[] values = PROGRESS_BY_TITLE.get(course.getTitle());
            if (values == null) {
                continue;
            }
            OnlineCourseStudentProgress row = OnlineCourseStudentProgress.builder()
                    .studentAdmissionId(studentAdmissionId)
                    .courseId(course.getId())
                    .progressPercent(values[0])
                    .ratingCount(values[1])
                    .certificateAvailable(values[2] == 1)
                    .build();
            progressRepository.save(row);
        }
    }
}
