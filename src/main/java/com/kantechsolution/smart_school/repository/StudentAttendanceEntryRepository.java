package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudentAttendanceEntryRepository extends JpaRepository<StudentAttendanceEntry, Long> {

    Optional<StudentAttendanceEntry> findByStudentAdmissionIdAndAttendanceDate(Long studentAdmissionId, LocalDate attendanceDate);

    List<StudentAttendanceEntry> findByAttendanceDateAndStudentAdmissionIdIn(LocalDate attendanceDate, List<Long> studentAdmissionIds);
}
