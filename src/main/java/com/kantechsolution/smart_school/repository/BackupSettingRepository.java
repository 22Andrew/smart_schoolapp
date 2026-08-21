package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BackupSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackupSettingRepository extends JpaRepository<BackupSetting, Long> {
}
