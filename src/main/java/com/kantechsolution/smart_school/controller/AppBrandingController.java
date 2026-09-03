package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppBrandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AppBrandingController {

    private final AppBrandingService appBrandingService;

    @GetMapping("/api/schsettings/branding")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getBranding() {
        return ResponseEntity.ok(appBrandingService.getBranding());
    }
}
