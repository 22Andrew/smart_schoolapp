package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolClassAttendanceTime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchoolClassAttendanceTimeRepository extends JpaRepository<SchoolClassAttendanceTime, Long> {

    List<SchoolClassAttendanceTime> findAllByOrderByClassIdAscSectionAsc();
}
