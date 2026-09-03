package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AlumniService;
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
public class AlumniController {

    private final AlumniService alumniService;

    @GetMapping("/admin/alumni/alumnilist")
    public String alumniListPage() {
        return "alumni-list";
    }

    @GetMapping("/api/alumni")
    @ResponseBody
    public ResponseEntity<?> search(@RequestParam(required = false) Long sessionId,
                                    @RequestParam(required = false) Long classId,
                                    @RequestParam(required = false) String section,
                                    @RequestParam(required = false) String admissionNumber) {
        return ResponseEntity.ok(alumniService.search(sessionId, classId, section, admissionNumber));
    }

    @GetMapping("/api/alumni/{id:\\d+}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return wrap("Alumni loaded successfully!", HttpStatus.OK, () -> alumniService.getById(id));
    }

    @PostMapping(value = "/api/alumni/{id:\\d+}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
                                                      @RequestParam(required = false) String currentPhone,
                                                      @RequestParam(required = false) String currentEmail,
                                                      @RequestParam(required = false) String occupation,
                                                      @RequestParam(required = false) String address,
                                                      @RequestParam(required = false) MultipartFile photo,
                                                      @RequestParam(required = false) Boolean removePhoto) {
        return wrap("Alumni details saved successfully!", HttpStatus.OK, () ->
                alumniService.update(id, currentPhone, currentEmail, occupation, address, photo, Boolean.TRUE.equals(removePhoto)));
    }

    @DeleteMapping("/api/alumni/{id:\\d+}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        return wrap("Alumni removed successfully!", HttpStatus.OK, () -> {
            alumniService.delete(id);
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
