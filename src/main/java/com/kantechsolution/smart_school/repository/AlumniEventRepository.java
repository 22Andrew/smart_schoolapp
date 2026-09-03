package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AlumniEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumniEventRepository extends JpaRepository<AlumniEvent, Long> {
    List<AlumniEvent> findAllByOrderByFromDateDescIdDesc();
}
