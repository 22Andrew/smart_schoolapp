package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CbseObservationService implements ApplicationRunner {

    private final CbseObservationParameterRepository parameterRepository;
    private final CbseObservationRepository observationRepository;
    private final CbseObservationAssignRepository assignRepository;
    private final CbseExamTermRepository termRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (parameterRepository.count() == 0) {
            seedParameters();
        }
        if (observationRepository.count() == 0) {
            seedObservations();
        }
    }

    // --- Parameters ---

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllParameters() {
        return parameterRepository.findAllByOrderByParameterNameAsc().stream()
                .map(this::parameterToResponse)
                .toList();
    }

    @Transactional
    public Map<String, Object> createParameter(Map<String, Object> body) {
        String name = text(body.get("parameterName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Parameter is required");
        }
        if (parameterRepository.existsByParameterNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Parameter already exists");
        }
        CbseObservationParameter parameter = CbseObservationParameter.builder()
                .parameterName(name)
                .build();
        return parameterToResponse(parameterRepository.save(parameter));
    }

    @Transactional
    public Map<String, Object> updateParameter(Long id, Map<String, Object> body) {
        CbseObservationParameter parameter = requireParameter(id);
        String name = text(body.get("parameterName"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Parameter is required");
        }
        if (parameterRepository.existsByParameterNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Parameter already exists");
        }
        parameter.setParameterName(name);
        return parameterToResponse(parameterRepository.save(parameter));
    }

    @Transactional
    public void deleteParameter(Long id) {
        if (!parameterRepository.existsById(id)) {
            throw new RuntimeException("Parameter not found with ID: " + id);
        }
        parameterRepository.deleteById(id);
    }

    // --- Observations ---

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllObservations() {
        return observationRepository.findAllByOrderByObservationNameAsc().stream()
                .map(this::observationToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getObservationById(Long id) {
        return observationToResponse(requireObservation(id));
    }

    @Transactional
    public Map<String, Object> createObservation(Map<String, Object> body) {
        CbseObservation observation = mapObservation(new CbseObservation(), body);
        validateObservation(observation, null);
        return observationToResponse(observationRepository.save(observation));
    }

    @Transactional
    public Map<String, Object> updateObservation(Long id, Map<String, Object> body) {
        CbseObservation observation = requireObservation(id);
        mapObservation(observation, body);
        validateObservation(observation, id);
        return observationToResponse(observationRepository.save(observation));
    }

    @Transactional
    public void deleteObservation(Long id) {
        if (!observationRepository.existsById(id)) {
            throw new RuntimeException("Observation not found with ID: " + id);
        }
        observationRepository.deleteById(id);
    }

    // --- Assignments ---

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignments() {
        return assignRepository.findAllByOrderByIdDesc().stream()
                .map(this::assignToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTermOptions() {
        return termRepository.findAllByOrderByTermNameAsc().stream()
                .map(term -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", term.getId());
                    map.put("termName", term.getTermName());
                    map.put("termCode", term.getTermCode());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getObservationOptions() {
        return observationRepository.findAllByOrderByObservationNameAsc().stream()
                .map(obs -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", obs.getId());
                    map.put("observationName", obs.getObservationName());
                    return map;
                })
                .toList();
    }

    @Transactional
    public Map<String, Object> createAssignment(Map<String, Object> body) {
        Long observationId = parseLong(body.get("observationId"));
        Long termId = parseLong(body.get("termId"));
        String description = text(body.get("description"));

        if (observationId == null) {
            throw new IllegalArgumentException("Observation is required");
        }
        if (termId == null) {
            throw new IllegalArgumentException("Term is required");
        }
        if (description.isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        CbseObservation observation = requireObservation(observationId);
        CbseExamTerm term = requireTerm(termId);

        if (assignRepository.existsByCbseObservationIdAndCbseExamTermId(observationId, termId)) {
            throw new IllegalArgumentException("This observation is already assigned to the selected term");
        }

        CbseObservationAssign assign = CbseObservationAssign.builder()
                .cbseObservation(observation)
                .cbseExamTerm(term)
                .description(description)
                .build();
        return assignToResponse(assignRepository.save(assign));
    }

    @Transactional
    public Map<String, Object> updateAssignment(Long id, Map<String, Object> body) {
        CbseObservationAssign assign = requireAssignment(id);
        Long observationId = parseLong(body.get("observationId"));
        Long termId = parseLong(body.get("termId"));
        String description = text(body.get("description"));

        if (observationId == null) {
            throw new IllegalArgumentException("Observation is required");
        }
        if (termId == null) {
            throw new IllegalArgumentException("Term is required");
        }
        if (description.isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        if (assignRepository.existsByCbseObservationIdAndCbseExamTermIdAndIdNot(observationId, termId, id)) {
            throw new IllegalArgumentException("This observation is already assigned to the selected term");
        }

        assign.setCbseObservation(requireObservation(observationId));
        assign.setCbseExamTerm(requireTerm(termId));
        assign.setDescription(description);
        return assignToResponse(assignRepository.save(assign));
    }

    @Transactional
    public void deleteAssignment(Long id) {
        if (!assignRepository.existsById(id)) {
            throw new RuntimeException("Assignment not found with ID: " + id);
        }
        assignRepository.deleteById(id);
    }

    private CbseObservationParameter requireParameter(Long id) {
        return parameterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parameter not found with ID: " + id));
    }

    private CbseObservation requireObservation(Long id) {
        return observationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Observation not found with ID: " + id));
    }

    private CbseExamTerm requireTerm(Long id) {
        return termRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Term not found"));
    }

    private CbseObservationAssign requireAssignment(Long id) {
        return assignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + id));
    }

    private CbseObservation mapObservation(CbseObservation observation, Map<String, Object> body) {
        observation.setObservationName(text(body.get("observationName")));
        observation.setObservationDescription(text(body.get("observationDescription")));

        observation.getDetails().clear();
        int sortOrder = 0;
        for (Map<String, Object> row : castDetailRows(body.get("details"))) {
            Long parameterId = parseLong(row.get("parameterId"));
            Integer maxMarks = parseInteger(row.get("maxMarks"));
            if (parameterId == null || maxMarks == null) {
                continue;
            }
            CbseObservationParameter parameter = requireParameter(parameterId);
            observation.getDetails().add(CbseObservationDetail.builder()
                    .cbseObservation(observation)
                    .parameter(parameter)
                    .maxMarks(maxMarks)
                    .sortOrder(sortOrder++)
                    .build());
        }
        return observation;
    }

    private void validateObservation(CbseObservation observation, Long excludeId) {
        if (observation.getObservationName().isBlank()) {
            throw new IllegalArgumentException("Observation is required");
        }
        boolean exists = excludeId == null
                ? observationRepository.existsByObservationNameIgnoreCase(observation.getObservationName())
                : observationRepository.existsByObservationNameIgnoreCaseAndIdNot(
                        observation.getObservationName(), excludeId);
        if (exists) {
            throw new IllegalArgumentException("Observation already exists");
        }
        if (observation.getDetails().isEmpty()) {
            throw new IllegalArgumentException("At least one parameter row is required");
        }
    }

    private Map<String, Object> parameterToResponse(CbseObservationParameter parameter) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", parameter.getId());
        map.put("parameterName", parameter.getParameterName());
        return map;
    }

    private Map<String, Object> observationToResponse(CbseObservation observation) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", observation.getId());
        map.put("observationName", observation.getObservationName());
        map.put("observationDescription", observation.getObservationDescription());
        map.put("details", observation.getDetails().stream().map(detail -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", detail.getId());
            row.put("parameterId", detail.getParameter().getId());
            row.put("parameterName", detail.getParameter().getParameterName());
            row.put("maxMarks", detail.getMaxMarks());
            return row;
        }).toList());
        return map;
    }

    private Map<String, Object> assignToResponse(CbseObservationAssign assign) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", assign.getId());
        map.put("observationId", assign.getCbseObservation().getId());
        map.put("observationName", assign.getCbseObservation().getObservationName());
        map.put("termId", assign.getCbseExamTerm().getId());
        map.put("termName", assign.getCbseExamTerm().getTermName());
        map.put("termCode", assign.getCbseExamTerm().getTermCode());
        map.put("description", assign.getDescription());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.valueOf(String.valueOf(value));
    }

    private Integer parseInteger(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Integer.valueOf(String.valueOf(value));
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castDetailRows(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                rows.add((Map<String, Object>) map);
            }
        }
        return rows;
    }

    private void seedParameters() {
        List.of("Behaviour", "Game", "Art & Culture", "Painting").forEach(name ->
                parameterRepository.save(CbseObservationParameter.builder().parameterName(name).build()));
    }

    private void seedObservations() {
        List<CbseObservationParameter> params = parameterRepository.findAllByOrderByParameterNameAsc();
        if (params.isEmpty()) {
            return;
        }

        String description = "In an observational study, researchers study how participants perform certain behaviours "
                + "or activities in real-life settings without manipulating variables.";

        CbseObservation obs1 = CbseObservation.builder()
                .observationName("Cbse Exam Observation 1")
                .observationDescription(description)
                .build();
        obs1.getDetails().add(buildDetail(obs1, params.get(0), 20, 0));
        obs1.getDetails().add(buildDetail(obs1, params.get(2), 25, 1));
        observationRepository.save(obs1);

        CbseObservation obs2 = CbseObservation.builder()
                .observationName("Cbse Exam Observation 2")
                .observationDescription(description)
                .build();
        obs2.getDetails().add(buildDetail(obs2, params.get(1), 30, 0));
        observationRepository.save(obs2);

        CbseObservation obs3 = CbseObservation.builder()
                .observationName("Cbse Exam Observation 3")
                .observationDescription(description)
                .build();
        obs3.getDetails().add(buildDetail(obs3, params.get(3), 20, 0));
        observationRepository.save(obs3);
    }

    private CbseObservationDetail buildDetail(CbseObservation observation,
                                              CbseObservationParameter parameter,
                                              int maxMarks,
                                              int sortOrder) {
        return CbseObservationDetail.builder()
                .cbseObservation(observation)
                .parameter(parameter)
                .maxMarks(maxMarks)
                .sortOrder(sortOrder)
                .build();
    }
}
