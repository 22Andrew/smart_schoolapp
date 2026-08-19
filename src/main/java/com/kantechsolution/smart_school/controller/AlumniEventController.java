package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AlumniEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Controller
@RequiredArgsConstructor
public class AlumniEventController {

    private final AlumniEventService alumniEventService;

    @GetMapping("/admin/alumni/events")
    public String eventsPage() {
        return "alumni-events";
    }

    @GetMapping("/api/alumni/events")
    @ResponseBody
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(alumniEventService.list());
    }

    @PostMapping(value = "/api/alumni/events", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> create(@RequestParam Map<String, String> fields,
                                                      @RequestParam(required = false) MultipartFile photo) {
        return wrap("Event saved successfully!", HttpStatus.CREATED, () ->
                alumniEventService.save(null, fields, photo, false));
    }

    @PostMapping(value = "/api/alumni/events/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
                                                      @RequestParam Map<String, String> fields,
                                                      @RequestParam(required = false) MultipartFile photo,
                                                      @RequestParam(required = false) Boolean removePhoto) {
        return wrap("Event updated successfully!", HttpStatus.OK, () ->
                alumniEventService.save(id, fields, photo, Boolean.TRUE.equals(removePhoto)));
    }

    @DeleteMapping("/api/alumni/events/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        return wrap("Event deleted successfully!", HttpStatus.OK, () -> {
            alumniEventService.delete(id);
            return Map.of();
        });
    }

    private ResponseEntity<Map<String, Object>> wrap(String message, HttpStatus status, Supplier<Map<String, Object>> action) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.get();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
