package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.BehaviourIncident;
import com.kantechsolution.smart_school.model.BehaviourStudentIncident;
import com.kantechsolution.smart_school.repository.BehaviourIncidentRepository;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentBehaviourProfileSeedService {

    private final BehaviourStudentIncidentRepository incidentRepository;
    private final BehaviourIncidentRepository masterIncidentRepository;

    @Transactional
    public void seedIfEmpty(Long studentAdmissionId) {
        if (studentAdmissionId == null) {
            return;
        }
        if (incidentRepository.countByStudentAdmissionId(studentAdmissionId) > 0) {
            return;
        }

        seedRow(studentAdmissionId, "Improper behaviour", LocalDate.of(2026, 3, 7));
        seedRow(studentAdmissionId, "Student Good Behaviour", LocalDate.of(2026, 3, 7));
        seedRow(studentAdmissionId, "Respect others/property.", LocalDate.of(2026, 3, 7));
        seedRow(studentAdmissionId, "Theft", LocalDate.of(2026, 3, 7));
        seedRow(studentAdmissionId, "Student Good Behaviour", LocalDate.of(2026, 1, 4));
    }

    private void seedRow(Long studentAdmissionId, String title, LocalDate incidentDate) {
        Optional<BehaviourIncident> master = masterIncidentRepository.findByTitleIgnoreCase(title);
        if (master.isEmpty()) {
            return;
        }
        BehaviourIncident incident = master.get();
        BehaviourStudentIncident row = new BehaviourStudentIncident();
        row.setStudentAdmissionId(studentAdmissionId);
        row.setIncidentId(incident.getId());
        row.setTitle(incident.getTitle());
        row.setPoints(incident.getPoints() == null ? 0 : incident.getPoints());
        row.setDescription(incident.getDescription());
        row.setIncidentDate(incidentDate);
        row.setAssignedBy("Joe Black (9000)");
        incidentRepository.save(row);
    }
}
