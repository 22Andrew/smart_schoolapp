package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AnnualHoliday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnualHolidayRepository extends JpaRepository<AnnualHoliday, Long> {

    List<AnnualHoliday> findAllByOrderByFromDateDescIdDesc();

    List<AnnualHoliday> findByHolidayTypeIgnoreCaseOrderByFromDateDescIdDesc(String holidayType);
}
