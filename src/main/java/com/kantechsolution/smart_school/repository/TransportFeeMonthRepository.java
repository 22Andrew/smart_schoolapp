package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportFeeMonth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportFeeMonthRepository extends JpaRepository<TransportFeeMonth, Long> {

    List<TransportFeeMonth> findAllByOrderByMonthIndexAsc();

    Optional<TransportFeeMonth> findByMonthNameIgnoreCase(String monthName);
}
