package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SystemUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SystemUpdateController {

    private final SystemUpdateService systemUpdateService;

    @GetMapping({"/admin/systemupdate", "/admin/systemupdate/", "/admin/systemupdate/index"})
    public String page() {
        return "systemupdate";
    }

    @GetMapping("/api/system-update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> overview() {
        return ResponseEntity.ok(systemUpdateService.overview());
    }
}
