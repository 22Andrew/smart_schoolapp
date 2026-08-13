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
        return sessionRepository.findAllByOrderBySessionNameAsc().stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSessionById(Long id) {
        return toMap(requireSession(id));
    }

    @Transactional(readOnly = true)
    public String getCurrentSessionName() {
        return sessionRepository.findByCurrentTrue()
                .map(AcademicSession::getSessionName)
                .orElse("2026-27");
    }

    @Transactional
    public Map<String, Object> createSession(Map<String, Object> payload) {
        String sessionName = requiredSessionName(payload.get("sessionName"));
        if (sessionRepository.findBySessionNameIgnoreCase(sessionName).isPresent()) {
            throw new IllegalArgumentException("Session already exists");
        }

        AcademicSession session = AcademicSession.builder()
                .sessionName(sessionName)
                .current(false)
                .build();
        session.setIsActive(true);
        return toMap(sessionRepository.save(session));
    }

    @Transactional
    public Map<String, Object> updateSession(Long id, Map<String, Object> payload) {
        AcademicSession session = requireSession(id);
        String sessionName = requiredSessionName(payload.get("sessionName"));

        sessionRepository.findBySessionNameIgnoreCase(sessionName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Session already exists");
            }
        });

        session.setSessionName(sessionName);
        return toMap(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long id) {
        AcademicSession session = requireSession(id);
        if (Boolean.TRUE.equals(session.getCurrent())) {
            throw new IllegalArgumentException("Cannot delete the active session");
        }
        sessionRepository.delete(session);
    }

    @Transactional
    public Map<String, Object> activateSession(Long id) {
        requireSession(id);
        List<AcademicSession> all = sessionRepository.findAll();
        all.forEach(item -> item.setCurrent(item.getId().equals(id)));
        sessionRepository.saveAll(all);
        return toMap(requireSession(id));
    }

    private AcademicSession requireSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
    }

    private String requiredSessionName(Object value) {
        String sessionName = value == null ? "" : value.toString().trim();
        if (sessionName.isBlank()) {
            throw new IllegalArgumentException("Session is required");
        }
        return sessionName;
    }

    private Map<String, Object> toMap(AcademicSession session) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", session.getId());
        row.put("sessionName", session.getSessionName());
        row.put("current", Boolean.TRUE.equals(session.getCurrent()));
        return row;
    }

    private void seedSessions() {
        for (int year = 2016; year <= 2029; year++) {
            int nextYear = (year + 1) % 100;
            String sessionName = String.format("%d-%02d", year, nextYear);
            boolean isCurrent = "2026-27".equals(sessionName);
            AcademicSession session = AcademicSession.builder()
                    .sessionName(sessionName)
                    .current(isCurrent)
                    .build();
            session.setIsActive(true);
            sessionRepository.save(session);
        }
    }
}
