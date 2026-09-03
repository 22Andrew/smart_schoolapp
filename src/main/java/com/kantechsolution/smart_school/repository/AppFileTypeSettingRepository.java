package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppFileTypeSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppFileTypeSettingRepository extends JpaRepository<AppFileTypeSetting, Long> {
}
