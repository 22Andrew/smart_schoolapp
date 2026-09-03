package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppCaptchaSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppCaptchaSettingRepository extends JpaRepository<AppCaptchaSetting, Long> {

    List<AppCaptchaSetting> findAllByOrderBySortOrderAscDisplayNameAsc();

    Optional<AppCaptchaSetting> findBySlug(String slug);
}
