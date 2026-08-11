package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BehaviourSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BehaviourSettingRepository extends JpaRepository<BehaviourSetting, Long> {
}
