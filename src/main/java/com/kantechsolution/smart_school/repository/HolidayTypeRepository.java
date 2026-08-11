package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.HolidayType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HolidayTypeRepository extends JpaRepository<HolidayType, Long> {

    List<HolidayType> findAllByOrderByNameAsc();

    Optional<HolidayType> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
