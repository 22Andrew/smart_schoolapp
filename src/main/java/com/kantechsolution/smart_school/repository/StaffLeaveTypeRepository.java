package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffLeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffLeaveTypeRepository extends JpaRepository<StaffLeaveType, Long> {

    List<StaffLeaveType> findAllByOrderByNameAsc();

    Optional<StaffLeaveType> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
