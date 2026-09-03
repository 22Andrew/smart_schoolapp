package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppStudentProfileSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppStudentProfileSettingController {

    private final AppStudentProfileSettingService appStudentProfileSettingService;

    @GetMapping({"/admin/profilesetting", "/admin/profilesetting/", "/admin/profilesetting/index",
            "/student/profilesetting", "/student/profilesetting/", "/student/profilesetting/index"})
    public String page() {
        return "profilesetting";
    }

    @GetMapping("/api/profile-settings/profile-update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProfileUpdateSettings() {
        return ResponseEntity.ok(appStudentProfileSettingService.getProfileUpdateSettings());
    }

    @PutMapping("/api/profile-settings/profile-update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveProfileUpdateSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean allowEditable = Boolean.TRUE.equals(payload.get("allowEditableFormFields"))
                    || "yes".equalsIgnoreCase(String.valueOf(payload.get("status")));
            Map<String, Object> saved = appStudentProfileSettingService.saveAllowEditable(allowEditable);
            response.put("success", true);
            response.put("message", "Record saved successfully");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/api/profile-settings/edit-fields/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEditFieldStatus(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = payload.get("slug") == null ? "" : payload.get("slug").toString();
            boolean enabled = Boolean.TRUE.equals(payload.get("enabled"))
                    || "yes".equalsIgnoreCase(String.valueOf(payload.get("status")));
            Map<String, Object> saved = appStudentProfileSettingService.setEditFieldEnabled(slug, enabled);
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

    @GetMapping("/api/profile-settings/dashboard-widgets")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listDashboardWidgets() {
        return ResponseEntity.ok(appStudentProfileSettingService.listDashboardWidgets());
    }

    @PutMapping("/api/profile-settings/dashboard-widgets/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDashboardWidgetStatus(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = payload.get("slug") == null ? "" : payload.get("slug").toString();
            String panel = payload.get("panel") == null ? "student" : payload.get("panel").toString();
            boolean enabled = Boolean.TRUE.equals(payload.get("enabled"))
                    || "yes".equalsIgnoreCase(String.valueOf(payload.get("status")));
            Map<String, Object> saved = appStudentProfileSettingService.setDashboardWidgetEnabled(slug, panel, enabled);
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
