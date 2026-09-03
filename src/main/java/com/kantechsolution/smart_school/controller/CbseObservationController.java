package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseObservationService;
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
public class CbseObservationController {

    private final CbseObservationService cbseObservationService;

    @GetMapping("/cbseexam/observation/assign")
    public String showAssignObservationPage() {
        return "cbseexam-observation-assign";
    }

    @GetMapping("/api/cbse-observations/parameters")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getParameters() {
        return ResponseEntity.ok(cbseObservationService.getAllParameters());
    }

    @PostMapping("/api/cbse-observations/parameters")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createParameter(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.createParameter(body),
                "Parameter saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-observations/parameters/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateParameter(@PathVariable Long id,
                                                               @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.updateParameter(id, body),
                "Parameter updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-observations/parameters/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteParameter(@PathVariable Long id) {
        return deleteResponse(() -> cbseObservationService.deleteParameter(id),
                "Parameter deleted successfully!");
    }

    @GetMapping("/api/cbse-observations")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getObservations() {
        return ResponseEntity.ok(cbseObservationService.getAllObservations());
    }

    @GetMapping("/api/cbse-observations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getObservation(@PathVariable Long id) {
        return ResponseEntity.ok(cbseObservationService.getObservationById(id));
    }

    @PostMapping("/api/cbse-observations")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createObservation(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.createObservation(body),
                "Observation saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-observations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateObservation(@PathVariable Long id,
                                                                 @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.updateObservation(id, body),
                "Observation updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-observations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteObservation(@PathVariable Long id) {
        return deleteResponse(() -> cbseObservationService.deleteObservation(id),
                "Observation deleted successfully!");
    }

    @GetMapping("/api/cbse-observations/assignments")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getAssignments() {
        return ResponseEntity.ok(cbseObservationService.getAllAssignments());
    }

    @GetMapping("/api/cbse-observations/terms")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTermOptions() {
        return ResponseEntity.ok(cbseObservationService.getTermOptions());
    }

    @GetMapping("/api/cbse-observations/options")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getObservationOptions() {
        return ResponseEntity.ok(cbseObservationService.getObservationOptions());
    }

    @PostMapping("/api/cbse-observations/assignments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createAssignment(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.createAssignment(body),
                "Observation term assigned successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-observations/assignments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateAssignment(@PathVariable Long id,
                                                                @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseObservationService.updateAssignment(id, body),
                "Assignment updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-observations/assignments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteAssignment(@PathVariable Long id) {
        return deleteResponse(() -> cbseObservationService.deleteAssignment(id),
                "Assignment deleted successfully!");
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Request failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> deleteResponse(DeleteAction action, String message) {
        Map<String, Object> response = new HashMap<>();
        try {
            action.run();
            response.put("success", true);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Delete failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }

    @FunctionalInterface
    private interface DeleteAction {
        void run();
    }
}
