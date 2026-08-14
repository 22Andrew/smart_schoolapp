package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ContentShareLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentShareLogRepository extends JpaRepository<ContentShareLog, Long> {
    List<ContentShareLog> findAllByOrderByShareDateDescCreatedAtDesc();
}
