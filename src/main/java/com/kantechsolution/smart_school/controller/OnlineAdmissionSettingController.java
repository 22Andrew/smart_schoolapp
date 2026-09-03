package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.OnlineAdmissionSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class OnlineAdmissionSettingController {

    private final OnlineAdmissionSettingService onlineAdmissionSettingService;

    @GetMapping({
            "/admin/onlineadmission/admissionsetting",
            "/admin/onlineadmission/admissionsetting/",
            "/admin/onlineadmission/admissionsetting/index"
    })
    public String page() {
        return "admissionsetting";
    }

    @GetMapping("/api/online-admission-settings/form")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFormSettings() {
        return ResponseEntity.ok(onlineAdmissionSettingService.getFormSettings());
    }

    @PostMapping(value = "/api/online-admission-settings/form", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveFormSettings(
            @RequestParam Map<String, String> payload,
            @RequestPart(value = "applicationForm", required = false) MultipartFile applicationForm) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = onlineAdmissionSettingService.saveFormSettings(payload, applicationForm);
            response.put("success", true);
            response.put("message", "Record saved successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
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

    @GetMapping("/api/online-admission-settings/fields")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listFields() {
        return ResponseEntity.ok(onlineAdmissionSettingService.listFields());
    }

    @PutMapping("/api/online-admission-settings/fields/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateFieldStatus(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = payload.get("slug") == null ? "" : payload.get("slug").toString();
            boolean enabled = Boolean.TRUE.equals(payload.get("enabled"))
                    || "yes".equalsIgnoreCase(String.valueOf(payload.get("status")));
            Map<String, Object> saved = onlineAdmissionSettingService.setFieldEnabled(slug, enabled);
            response.put("success", true);
            response.put("message", "Status change successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
