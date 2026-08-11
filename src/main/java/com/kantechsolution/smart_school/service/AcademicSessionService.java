package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AcademicSession;
import com.kantechsolution.smart_school.repository.AcademicSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(5)
public class AcademicSessionService implements ApplicationRunner {

    private final AcademicSessionRepository sessionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (sessionRepository.count() == 0) {
            seedSessions();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllSessions() {
        return sessionRepository.findAllByOrderBySessionNameDesc().stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public String getCurrentSessionName() {
        return sessionRepository.findByCurrentTrue()
                .map(AcademicSession::getSessionName)
                .orElse("2024-25");
    }

    private Map<String, Object> toMap(AcademicSession session) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", session.getId());
        row.put("sessionName", session.getSessionName());
        row.put("current", Boolean.TRUE.equals(session.getCurrent()));
        return row;
    }

    private void seedSessions() {
        sessionRepository.save(AcademicSession.builder().sessionName("2025-26").current(false).build());
        sessionRepository.save(AcademicSession.builder().sessionName("2024-25").current(true).build());
        sessionRepository.save(AcademicSession.builder().sessionName("2023-24").current(false).build());
        sessionRepository.save(AcademicSession.builder().sessionName("2022-23").current(false).build());
    }
}
