package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffPayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffPayrollRecordRepository extends JpaRepository<StaffPayrollRecord, Long> {

    Optional<StaffPayrollRecord> findByStaffMemberIdAndPayrollMonthAndPayrollYear(
            Long staffMemberId, Integer payrollMonth, Integer payrollYear);

    List<StaffPayrollRecord> findByPayrollMonthAndPayrollYearAndStaffMemberIdIn(
            Integer payrollMonth, Integer payrollYear, List<Long> staffMemberIds);
}
