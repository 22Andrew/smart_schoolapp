package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLogRepository extends JpaRepository<UserLog, Long> {

    List<UserLog> findByUserCategoryOrderByLoginDateTimeDesc(String userCategory);

    List<UserLog> findAllByOrderByLoginDateTimeDesc();
}
