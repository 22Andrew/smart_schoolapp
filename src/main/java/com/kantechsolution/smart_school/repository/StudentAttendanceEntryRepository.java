package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudentAttendanceEntryRepository extends JpaRepository<StudentAttendanceEntry, Long> {

    Optional<StudentAttendanceEntry> findByStudentAdmissionIdAndAttendanceDate(Long studentAdmissionId, LocalDate attendanceDate);

    List<StudentAttendanceEntry> findByAttendanceDateAndStudentAdmissionIdIn(LocalDate attendanceDate, List<Long> studentAdmissionIds);

    @Query("""
            SELECT e FROM StudentAttendanceEntry e
            WHERE e.studentAdmissionId = :studentId
              AND e.attendanceDate >= :startDate
              AND e.attendanceDate <= :endDate
            ORDER BY e.attendanceDate ASC
            """)
    List<StudentAttendanceEntry> findByStudentAndDateRange(
            @Param("studentId") Long studentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
