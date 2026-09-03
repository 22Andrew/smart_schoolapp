package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.CbseExamTerm;
import com.kantechsolution.smart_school.repository.CbseExamTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CbseExamTermService implements ApplicationRunner {

    private static final String DEFAULT_DESCRIPTION =
            "An examination is a formal test that assesses a person's knowledge, skills, or abilities in a particular subject or field.";

    private final CbseExamTermRepository cbseExamTermRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (cbseExamTermRepository.count() > 0) {
            return;
        }
        seedTerms();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllTerms() {
        return cbseExamTermRepository.findAllByOrderByTermNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getTermDisplayNames() {
        return cbseExamTermRepository.findAllByOrderByTermNameAsc().stream()
                .map(this::toDisplayName)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTermById(Long id) {
        CbseExamTerm term = cbseExamTermRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Term not found with ID: " + id));
        return toResponse(term);
    }

    @Transactional
    public Map<String, Object> createTerm(Map<String, Object> body) {
        CbseExamTerm term = mapTerm(new CbseExamTerm(), body);
        validateTerm(term, null);
        return toResponse(cbseExamTermRepository.save(term));
    }

    @Transactional
    public Map<String, Object> updateTerm(Long id, Map<String, Object> body) {
        CbseExamTerm existing = cbseExamTermRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Term not found with ID: " + id));
        CbseExamTerm term = mapTerm(existing, body);
        validateTerm(term, id);
        return toResponse(cbseExamTermRepository.save(term));
    }

    @Transactional
    public void deleteTerm(Long id) {
        if (!cbseExamTermRepository.existsById(id)) {
            throw new RuntimeException("Term not found with ID: " + id);
        }
        cbseExamTermRepository.deleteById(id);
    }

    private void seedTerms() {
        saveSeed("Term 1", "T021", DEFAULT_DESCRIPTION);
        saveSeed("Term 2", "T015", DEFAULT_DESCRIPTION);
    }

    private void saveSeed(String name, String code, String description) {
        cbseExamTermRepository.save(CbseExamTerm.builder()
                .termName(name)
                .termCode(code)
                .description(description)
                .build());
    }

    private CbseExamTerm mapTerm(CbseExamTerm term, Map<String, Object> body) {
        term.setTermName(text(body.get("termName")));
        term.setTermCode(text(body.get("termCode")));
        term.setDescription(text(body.get("description")));
        return term;
    }

    private void validateTerm(CbseExamTerm term, Long id) {
        if (term.getTermName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (term.getTermCode().isBlank()) {
            throw new IllegalArgumentException("Code is required");
        }
        if (id == null) {
            if (cbseExamTermRepository.existsByTermCodeIgnoreCase(term.getTermCode())) {
                throw new IllegalArgumentException("Term code already exists");
            }
        } else if (cbseExamTermRepository.existsByTermCodeIgnoreCaseAndIdNot(term.getTermCode(), id)) {
            throw new IllegalArgumentException("Term code already exists");
        }
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String toDisplayName(CbseExamTerm term) {
        return term.getTermName() + " (" + term.getTermCode() + ")";
    }

    private Map<String, Object> toResponse(CbseExamTerm term) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", term.getId());
        map.put("termName", term.getTermName());
        map.put("termCode", term.getTermCode());
        map.put("description", term.getDescription() != null ? term.getDescription() : "");
        return map;
    }
}
