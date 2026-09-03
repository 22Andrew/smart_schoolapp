package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.ExamGroup;
import com.kantechsolution.smart_school.service.ExamGroupExamDetailService;
import com.kantechsolution.smart_school.service.ExamGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ExamGroupController {

    private final ExamGroupService examGroupService;
    private final ExamGroupExamDetailService examGroupExamDetailService;

    @GetMapping("/examgroup")
    public String showExamGroupPage() {
        return "examgroup";
    }

    @GetMapping("/api/exam-groups")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamGroups() {
        return ResponseEntity.ok(examGroupService.getAllExamGroups());
    }

    @GetMapping("/api/exam-groups/types")
    @ResponseBody
    public ResponseEntity<List<String>> getExamTypes() {
        return ResponseEntity.ok(examGroupService.getExamTypes());
    }

    @GetMapping("/api/exam-groups/{id}/exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamsByGroup(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(examGroupService.getExamsByGroupId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/exam-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createExamGroup(@RequestBody ExamGroup examGroup) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.saveExamGroup(examGroup);
            response.put("success", true);
            response.put("message", "Exam group saved successfully!");
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/exam-groups/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExamGroup(@PathVariable Long id, @RequestBody ExamGroup examGroup) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.updateExamGroup(id, examGroup);
            response.put("success", true);
            response.put("message", "Exam group updated successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/exam-groups/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteExamGroup(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            examGroupService.deleteExamGroup(id);
            response.put("success", true);
            response.put("message", "Exam group deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/exam-groups/{id}/exams")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addExamToGroup(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.addExamToGroup(id, body.get("name"));
            response.put("success", true);
            response.put("message", "Exam added successfully!");
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add exam: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamGroupExamStudents(
            @PathVariable Long groupId,
            @PathVariable Long examId,
            @RequestParam Long classId,
            @RequestParam String section) {
        try {
            return ResponseEntity.ok(examGroupService.getExamStudents(groupId, examId, classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/exam-groups/{groupId}/exams/{examId}/students")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveExamGroupExamStudents(
            @PathVariable Long groupId,
            @PathVariable Long examId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Number> ids = (List<Number>) body.get("studentIds");
            List<Long> studentIds = ids == null ? List.of() : ids.stream().map(Number::longValue).toList();
            examGroupService.saveExamStudents(groupId, examId, studentIds);
            response.put("success", true);
            response.put("message", "Students assigned successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/exam-groups/form-options")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupFormOptions() {
        return ResponseEntity.ok(examGroupExamDetailService.getFormOptions());
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupExamDetail(
            @PathVariable Long groupId, @PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getExamDetail(groupId, examId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/exam-groups/{groupId}/exams/{examId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExamGroupExam(
            @PathVariable Long groupId, @PathVariable Long examId, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("message", "Exam updated successfully!");
            response.put("data", examGroupExamDetailService.updateExam(groupId, examId, body));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/subjects")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupExamSubjects(
            @PathVariable Long groupId, @PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getSubjectModalData(groupId, examId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/exam-groups/{groupId}/exams/{examId}/subjects")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveExamGroupExamSubjects(
            @PathVariable Long groupId, @PathVariable Long examId, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) body.get("subjects");
            examGroupExamDetailService.saveSubjects(groupId, examId, subjects);
            response.put("success", true);
            response.put("message", "Exam subjects saved successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/marks-view")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupExamMarksView(
            @PathVariable Long groupId, @PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getMarksView(groupId, examId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/subjects/{subjectId}/marks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupSubjectMarks(
            @PathVariable Long groupId,
            @PathVariable Long examId,
            @PathVariable Long subjectId,
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam(required = false) String sessionYear) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getSubjectMarksEntry(
                    groupId, examId, subjectId, classId, section, sessionYear));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/subjects/{subjectId}/marks/sample")
    public ResponseEntity<byte[]> exportExamGroupSubjectMarksSample(
            @PathVariable Long groupId,
            @PathVariable Long examId,
            @PathVariable Long subjectId,
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam(required = false) String sessionYear) {
        try {
            byte[] csv = examGroupExamDetailService.exportSubjectMarksSample(
                    groupId, examId, subjectId, classId, section, sessionYear);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=exam-marks-sample.csv")
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .body(csv);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/exam-groups/{groupId}/exams/{examId}/subjects/{subjectId}/marks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveExamGroupSubjectMarks(
            @PathVariable Long groupId, @PathVariable Long examId, @PathVariable Long subjectId,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) body.get("rows");
            String sessionYear = body.get("sessionYear") == null ? null : String.valueOf(body.get("sessionYear"));
            examGroupExamDetailService.saveSubjectMarks(groupId, examId, subjectId, sessionYear, rows);
            response.put("success", true);
            response.put("message", "Marks saved successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/teacher-remarks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupTeacherRemarks(
            @PathVariable Long groupId, @PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getTeacherRemarks(groupId, examId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/exam-groups/{groupId}/exams/{examId}/teacher-remarks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveExamGroupTeacherRemarks(
            @PathVariable Long groupId, @PathVariable Long examId, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) body.get("rows");
            examGroupExamDetailService.saveTeacherRemarks(groupId, examId, rows);
            response.put("success", true);
            response.put("message", "Teacher remarks saved successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/exam-groups/{groupId}/exams/{examId}/rank")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExamGroupExamRank(
            @PathVariable Long groupId, @PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examGroupExamDetailService.getRankData(groupId, examId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/exam-groups/{groupId}/exams/{examId}/rank")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> generateExamGroupExamRank(
            @PathVariable Long groupId, @PathVariable Long examId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupExamDetailService.generateRank(groupId, examId);
            response.put("success", true);
            response.put("message", "Rank generated successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
