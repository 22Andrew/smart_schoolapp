package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffLeaveRequestRepository extends JpaRepository<StaffLeaveRequest, Long> {

    List<StaffLeaveRequest> findAllByOrderByApplyDateDescIdDesc();

    List<StaffLeaveRequest> findByStaffMemberIdOrderByApplyDateDescIdDesc(Long staffMemberId);
}
