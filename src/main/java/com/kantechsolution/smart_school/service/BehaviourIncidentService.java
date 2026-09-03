package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.BehaviourIncident;
import com.kantechsolution.smart_school.repository.BehaviourIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BehaviourIncidentService implements ApplicationRunner {

    @Autowired
    private BehaviourIncidentRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        seed("Respect others/property.", 10, "Respect others/property.");
        seed("Student Good Behaviour", 20, "Smile & have a good attitude and good behaviour.");
        seed("Theft", -15,
                "It's important to report cases of theft on campus so that the university or school can increase security where needed. They could also consider other options to combat incidents of theft, such as lockers.");
        seed("Improper behaviour", -10,
                "Improper behaviour could be observed in a staff member or another student. If the behaviour is threatening, concerning or inappropriate, the university or school will need to monitor the individual to ensure that the behaviour is not repetitive.");
        seed("Harassment and bullying", -10,
                "If students report this type of behaviour, institutions will be able to monitor the individuals involved. They can then try to resolve the situation.");
    }

    private void seed(String title, int points, String description) {
        BehaviourIncident incident = new BehaviourIncident();
        incident.setTitle(title);
        incident.setPoints(points);
        incident.setNegativeIncident(points < 0);
        incident.setDescription(description);
        incident.setActive(true);
        repository.save(incident);
    }

    public List<Map<String, Object>> listActive() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (BehaviourIncident incident : repository.findByActiveTrueOrderByIdAsc()) {
            rows.add(toMap(incident));
        }
        return rows;
    }

    public BehaviourIncident requireActive(Long id) {
        BehaviourIncident incident = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        if (!incident.isActive()) {
            throw new IllegalArgumentException("Incident is inactive");
        }
        return incident;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        BehaviourIncident incident = new BehaviourIncident();
        apply(incident, body);
        incident.setActive(true);
        return toMap(repository.save(incident));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        BehaviourIncident incident = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        apply(incident, body);
        return toMap(repository.save(incident));
    }

    @Transactional
    public void delete(Long id) {
        BehaviourIncident incident = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        repository.delete(incident);
    }

    private void apply(BehaviourIncident incident, Map<String, Object> body) {
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        String description = text(body.get("description"));
        if (description.isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        boolean negative = asBoolean(body.get("negativeIncident"), false);
        int absolutePoints = Math.abs(toInt(body.get("points"), 0));
        int signedPoints = negative ? -absolutePoints : absolutePoints;

        incident.setTitle(title);
        incident.setPoints(signedPoints);
        incident.setNegativeIncident(negative);
        incident.setDescription(description);
    }

    private Map<String, Object> toMap(BehaviourIncident incident) {
        int points = incident.getPoints() == null ? 0 : incident.getPoints();
        boolean negative = incident.isNegativeIncident() || points < 0;
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", incident.getId());
        map.put("title", incident.getTitle());
        map.put("points", points);
        map.put("negativeIncident", negative);
        map.put("description", incident.getDescription());
        return map;
    }

    private boolean asBoolean(Object value, boolean defaultValue) {
        if (value == null) return defaultValue;
        if (value instanceof Boolean bool) return bool;
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return defaultValue;
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "yes".equalsIgnoreCase(text);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private int toInt(Object value, int defaultValue) {
        if (value == null) return defaultValue;
        if (value instanceof Number number) return number.intValue();
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return defaultValue;
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Point must be a number");
        }
    }
}
