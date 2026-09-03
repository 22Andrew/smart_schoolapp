package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.PrintHeaderFooterService;
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
public class PrintHeaderFooterController {

    private final PrintHeaderFooterService printHeaderFooterService;

    @GetMapping({"/admin/printheaderfooter", "/admin/printheaderfooter/", "/admin/printheaderfooter/index"})
    public String page() {
        return "printheaderfooter";
    }

    @GetMapping("/api/printheaderfooter")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(printHeaderFooterService.list());
    }

    @PostMapping(value = "/api/printheaderfooter", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "footerContent", required = false) String footerContent,
            @RequestParam(value = "removeHeader", required = false) String removeHeader,
            @RequestPart(value = "header", required = false) MultipartFile header) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = printHeaderFooterService.save(
                    documentType,
                    footerContent,
                    header,
                    "true".equalsIgnoreCase(removeHeader) || "1".equals(removeHeader)
            );
            response.put("success", true);
            response.put("message", "Print header footer saved successfully!");
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
