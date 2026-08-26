package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "behaviour_student_incident_comments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviourStudentIncidentComment extends BaseEntity {

    @Column(name = "incident_record_id", nullable = false)
    private Long incidentRecordId;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "comment_text", nullable = false, length = 2000)
    private String commentText;

    @Column(name = "author_name", length = 150)
    private String authorName;
}
