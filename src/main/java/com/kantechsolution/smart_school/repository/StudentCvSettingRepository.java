package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentCvSettingRepository extends JpaRepository<StudentCvSetting, Long> {
}
