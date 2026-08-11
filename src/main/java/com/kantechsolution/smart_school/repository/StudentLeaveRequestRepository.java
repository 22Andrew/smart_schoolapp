package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentLeaveRequestRepository extends JpaRepository<StudentLeaveRequest, Long> {

    List<StudentLeaveRequest> findByClassIdAndSectionOrderByApplyDateDescIdDesc(Long classId, String section);
}
