package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BehaviourIncident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BehaviourIncidentRepository extends JpaRepository<BehaviourIncident, Long> {

    List<BehaviourIncident> findByActiveTrueOrderByIdAsc();
}
