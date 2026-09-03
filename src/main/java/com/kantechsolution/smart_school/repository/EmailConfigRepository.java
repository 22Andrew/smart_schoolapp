package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.EmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailConfigRepository extends JpaRepository<EmailConfig, Long> {
}
