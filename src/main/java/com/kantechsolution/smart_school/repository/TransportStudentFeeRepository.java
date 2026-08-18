package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportStudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportStudentFeeRepository extends JpaRepository<TransportStudentFee, Long> {

    List<TransportStudentFee> findByStudent_IdOrderByIdAsc(Long studentId);

    boolean existsByStudent_IdAndMonthNameIgnoreCase(Long studentId, String monthName);
}
