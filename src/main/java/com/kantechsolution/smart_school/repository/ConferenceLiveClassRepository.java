package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ConferenceLiveClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConferenceLiveClassRepository extends JpaRepository<ConferenceLiveClass, Long> {
    List<ConferenceLiveClass> findAllByOrderByClassDateTimeDescIdDesc();
}
