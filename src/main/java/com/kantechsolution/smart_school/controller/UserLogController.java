package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class UserLogController {

    private final UserLogService userLogService;

    @GetMapping("/admin/userlog")
    public String userLogPage() {
        return "user-log";
    }

    @GetMapping({"/report/userlog", "/report/userlog/userlogreport"})
    public RedirectView redirectLegacyUserLog() {
        return new RedirectView("/admin/userlog");
    }

    @GetMapping("/api/userlog")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(defaultValue = "all") String role) {
        return ResponseEntity.ok(userLogService.listLogs(role));
    }

    @DeleteMapping("/api/userlog")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            userLogService.clearAll();
            response.put("success", true);
            response.put("message", "User log records cleared successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
