package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.BehaviourStudentIncident;
import com.kantechsolution.smart_school.model.BehaviourStudentIncidentComment;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentCommentRepository;
import com.kantechsolution.smart_school.repository.BehaviourStudentIncidentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelBehaviourService {

    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final UserPanelContextService userPanelContextService;
    private final BehaviourStudentIncidentRepository incidentRepository;
    private final BehaviourStudentIncidentCommentRepository commentRepository;

    public UserPanelBehaviourService(
            UserPanelContextService userPanelContextService,
            BehaviourStudentIncidentRepository incidentRepository,
            BehaviourStudentIncidentCommentRepository commentRepository
    ) {
        this.userPanelContextService = userPanelContextService;
        this.incidentRepository = incidentRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBehaviour(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);

        List<Map<String, Object>> records = incidentRepository
                .findByStudentAdmissionIdOrderByIncidentDateDescIdDesc(student.getId())
                .stream()
                .map(this::toRecordResponse)
                .toList();

        int totalScore = records.stream()
                .mapToInt(row -> (Integer) row.getOrDefault("points", 0))
                .sum();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("totalScore", totalScore);
        response.put("records", records);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getComments(Authentication authentication, Long incidentRecordId) {
        StudentAdmission student = requireStudent(authentication);
        BehaviourStudentIncident incident = requireOwnedIncident(student.getId(), incidentRecordId);

        List<Map<String, Object>> comments = commentRepository
                .findByIncidentRecordIdOrderByCreatedAtAscIdAsc(incident.getId())
                .stream()
                .map(this::toCommentResponse)
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("incidentId", incident.getId());
        response.put("comments", comments);
        return response;
    }

    @Transactional
    public Map<String, Object> addComment(
            Authentication authentication,
            Long incidentRecordId,
            Map<String, Object> body
    ) {
        StudentAdmission student = requireStudent(authentication);
        BehaviourStudentIncident incident = requireOwnedIncident(student.getId(), incidentRecordId);

        String commentText = body.get("comment") == null ? "" : String.valueOf(body.get("comment")).trim();
        if (commentText.isEmpty()) {
            throw new IllegalArgumentException("Comment is required");
        }

        BehaviourStudentIncidentComment comment = BehaviourStudentIncidentComment.builder()
                .incidentRecordId(incident.getId())
                .studentAdmissionId(student.getId())
                .commentText(commentText)
                .authorName(resolveAuthorName(authentication))
                .build();

        return toCommentResponse(commentRepository.save(comment));
    }

    private Map<String, Object> toRecordResponse(BehaviourStudentIncident row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("title", row.getTitle());
        map.put("points", row.getPoints() == null ? 0 : row.getPoints());
        map.put("date", row.getIncidentDate() != null
                ? row.getIncidentDate().format(DISPLAY_DATE)
                : "");
        map.put("description", row.getDescription() == null ? "" : row.getDescription());
        map.put("assignBy", row.getAssignedBy() == null ? "" : row.getAssignedBy());
        map.put("commentCount", commentRepository.countByIncidentRecordId(row.getId()));
        return map;
    }

    private Map<String, Object> toCommentResponse(BehaviourStudentIncidentComment comment) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", comment.getId());
        map.put("comment", comment.getCommentText());
        map.put("authorName", comment.getAuthorName() == null ? "" : comment.getAuthorName());
        map.put("createdAt", comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : "");
        return map;
    }

    private BehaviourStudentIncident requireOwnedIncident(Long studentId, Long incidentRecordId) {
        if (incidentRecordId == null) {
            throw new IllegalArgumentException("Incident is required");
        }
        BehaviourStudentIncident incident = incidentRepository.findById(incidentRecordId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        if (!studentId.equals(incident.getStudentAdmissionId())) {
            throw new IllegalArgumentException("Incident not found");
        }
        return incident;
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }

    private String resolveAuthorName(Authentication authentication) {
        AppUserAccount account = userPanelContextService.resolveAccount(authentication);
        if (account == null) {
            return authentication != null ? authentication.getName() : "Student";
        }
        String username = account.getUsername() == null ? "Student" : account.getUsername();
        if (account.getSourceId() != null) {
            return username;
        }
        return username;
    }
}
