package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnlineCourseSettingRepository extends JpaRepository<OnlineCourseSetting, Long> {
}
