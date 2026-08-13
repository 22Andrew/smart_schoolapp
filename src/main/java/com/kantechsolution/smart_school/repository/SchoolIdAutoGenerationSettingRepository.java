package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolIdAutoGenerationSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolIdAutoGenerationSettingRepository extends JpaRepository<SchoolIdAutoGenerationSetting, Long> {
}
