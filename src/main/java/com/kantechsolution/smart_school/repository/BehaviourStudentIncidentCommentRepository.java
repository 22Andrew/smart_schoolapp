package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.BehaviourStudentIncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BehaviourStudentIncidentCommentRepository extends JpaRepository<BehaviourStudentIncidentComment, Long> {

    List<BehaviourStudentIncidentComment> findByIncidentRecordIdOrderByCreatedAtAscIdAsc(Long incidentRecordId);

    long countByIncidentRecordId(Long incidentRecordId);
}
