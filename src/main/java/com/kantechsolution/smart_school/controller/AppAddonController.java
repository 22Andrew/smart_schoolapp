package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppAddonService;
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
public class AppAddonController {

    private final AppAddonService appAddonService;

    @GetMapping({"/admin/addons", "/admin/addons/", "/admin/addons/index"})
    public String page() {
        return "addons";
    }

    @GetMapping("/api/addons")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(appAddonService.listInstalled());
    }

    @PostMapping(value = "/api/addons/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appAddonService.upload(file);
            response.put("success", true);
            response.put("message", "Addon uploaded successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @DeleteMapping("/api/addons/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uninstall(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            appAddonService.uninstall(id);
            response.put("success", true);
            response.put("message", "Addon uninstalled successfully!");
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
}
