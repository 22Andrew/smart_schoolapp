package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffAttendanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StaffAttendanceEntryRepository extends JpaRepository<StaffAttendanceEntry, Long> {

    Optional<StaffAttendanceEntry> findByStaffMemberIdAndAttendanceDate(Long staffMemberId, LocalDate attendanceDate);

    List<StaffAttendanceEntry> findByAttendanceDateAndStaffMemberIdIn(LocalDate attendanceDate, List<Long> staffMemberIds);
}
