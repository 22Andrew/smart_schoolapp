package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.MarksDivision;
import com.kantechsolution.smart_school.repository.MarksDivisionRepository;
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
public class MarksDivisionService implements ApplicationRunner {

    private final MarksDivisionRepository marksDivisionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (marksDivisionRepository.count() > 0) {
            return;
        }
        seedDivisions();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllDivisions() {
        return marksDivisionRepository.findAllByOrderByPercentFromDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDivisionById(Long id) {
        return toResponse(requireDivision(id));
    }

    @Transactional
    public Map<String, Object> createDivision(Map<String, Object> body) {
        MarksDivision division = mapDivision(new MarksDivision(), body);
        validateDivision(division, null);
        return toResponse(marksDivisionRepository.save(division));
    }

    @Transactional
    public Map<String, Object> updateDivision(Long id, Map<String, Object> body) {
        MarksDivision division = requireDivision(id);
        mapDivision(division, body);
        validateDivision(division, id);
        return toResponse(marksDivisionRepository.save(division));
    }

    @Transactional
    public void deleteDivision(Long id) {
        if (!marksDivisionRepository.existsById(id)) {
            throw new RuntimeException("Marks division not found with ID: " + id);
        }
        marksDivisionRepository.deleteById(id);
    }

    private MarksDivision requireDivision(Long id) {
        return marksDivisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marks division not found with ID: " + id));
    }

    private void validateDivision(MarksDivision division, Long id) {
        if (division.getDivisionName() == null || division.getDivisionName().isBlank()) {
            throw new IllegalArgumentException("Division name is required");
        }
        if (division.getPercentFrom() == null || division.getPercentUpto() == null) {
            throw new IllegalArgumentException("Percent from and percent upto are required");
        }
        if (division.getPercentFrom() < division.getPercentUpto()) {
            throw new IllegalArgumentException("Percent from must be greater than or equal to percent upto");
        }
        boolean exists = id == null
                ? marksDivisionRepository.existsByDivisionNameIgnoreCase(division.getDivisionName())
                : marksDivisionRepository.existsByDivisionNameIgnoreCaseAndIdNot(division.getDivisionName(), id);
        if (exists) {
            throw new IllegalArgumentException("Division name already exists");
        }
    }

    private MarksDivision mapDivision(MarksDivision division, Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Division data is required");
        }
        division.setDivisionName(text(body.get("divisionName")));
        division.setPercentFrom(number(body.get("percentFrom")));
        division.setPercentUpto(number(body.get("percentUpto")));
        return division;
    }

    private Map<String, Object> toResponse(MarksDivision division) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", division.getId());
        map.put("divisionName", division.getDivisionName());
        map.put("percentFrom", division.getPercentFrom());
        map.put("percentUpto", division.getPercentUpto());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Double number(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Double.parseDouble(String.valueOf(value).trim());
    }

    private void seedDivisions() {
        marksDivisionRepository.save(MarksDivision.builder()
                .divisionName("First")
                .percentFrom(100.0)
                .percentUpto(60.0)
                .build());
        marksDivisionRepository.save(MarksDivision.builder()
                .divisionName("Second")
                .percentFrom(60.0)
                .percentUpto(40.0)
                .build());
        marksDivisionRepository.save(MarksDivision.builder()
                .divisionName("Third")
                .percentFrom(40.0)
                .percentUpto(0.0)
                .build());
    }
}
