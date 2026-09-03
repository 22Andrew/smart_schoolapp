package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.QrAttendanceSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrAttendanceSettingRepository extends JpaRepository<QrAttendanceSetting, Long> {
}
