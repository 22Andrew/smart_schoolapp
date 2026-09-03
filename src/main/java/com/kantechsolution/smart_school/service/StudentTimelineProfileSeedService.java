package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentTimeline;
import com.kantechsolution.smart_school.repository.StudentTimelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentTimelineProfileSeedService {

    private final StudentTimelineRepository studentTimelineRepository;

    @Transactional
    public void seedIfEmpty(Long studentAdmissionId) {
        if (studentAdmissionId == null) {
            return;
        }
        if (studentTimelineRepository.countByStudentAdmissionId(studentAdmissionId) > 0) {
            return;
        }

        List<StudentTimeline> entries = List.of(
                StudentTimeline.builder()
                        .studentAdmissionId(studentAdmissionId)
                        .title("All pending work submitted")
                        .description("")
                        .eventDate(LocalDate.of(2026, 4, 2))
                        .visibleToStudent(true)
                        .nodeType("calendar")
                        .build(),
                StudentTimeline.builder()
                        .studentAdmissionId(studentAdmissionId)
                        .title("PLEASE PURCHASE NEW BOOKS")
                        .description("")
                        .eventDate(LocalDate.of(2026, 4, 4))
                        .visibleToStudent(true)
                        .nodeType("calendar")
                        .build()
        );

        studentTimelineRepository.saveAll(entries);
    }
}
