package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppOnlineAdmissionSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppOnlineAdmissionSettingRepository extends JpaRepository<AppOnlineAdmissionSetting, Long> {
}
