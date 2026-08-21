package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ThermalPrintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ThermalPrintController {

    private final ThermalPrintService thermalPrintService;

    @GetMapping({"/admin/thermalprint", "/admin/thermalprint/", "/admin/thermalprint/index"})
    public String page() {
        return "thermalprint";
    }

    @GetMapping("/api/thermalprint")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSetting() {
        return ResponseEntity.ok(thermalPrintService.getSetting());
    }

    @PostMapping("/api/thermalprint")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = thermalPrintService.save(payload);
            response.put("success", true);
            response.put("message", "Thermal print settings saved successfully!");
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
