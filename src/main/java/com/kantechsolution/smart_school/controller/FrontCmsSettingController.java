package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.FrontCmsSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class FrontCmsSettingController {

    private final FrontCmsSettingService frontCmsSettingService;

    @GetMapping({"/admin/frontcms", "/admin/frontcms/", "/admin/frontcms/index"})
    public String page() {
        return "frontcms";
    }

    @GetMapping("/api/frontcms")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSetting() {
        return ResponseEntity.ok(frontCmsSettingService.getSetting());
    }

    @PostMapping(value = "/api/frontcms", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam Map<String, String> payload,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @RequestPart(value = "favicon", required = false) MultipartFile favicon) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = frontCmsSettingService.save(payload, logo, favicon);
            response.put("success", true);
            response.put("message", "Front CMS settings saved successfully!");
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
}
