package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppStudentProfileSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppStudentProfileSettingRepository extends JpaRepository<AppStudentProfileSetting, Long> {
}
