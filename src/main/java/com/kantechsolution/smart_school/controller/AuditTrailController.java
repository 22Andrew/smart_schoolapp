package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AuditTrailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AuditTrailController {

    private final AuditTrailService auditTrailService;

    @GetMapping("/admin/audit")
    public String auditTrailPage() {
        return "audit-trail";
    }

    @GetMapping({"/report/audittrail", "/report/audittrail/audittrailreport"})
    public RedirectView redirectLegacyAuditTrail() {
        return new RedirectView("/admin/audit");
    }

    @GetMapping("/api/audit-trail")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(auditTrailService.listRecords());
    }

    @DeleteMapping("/api/audit-trail")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            auditTrailService.clearAll();
            response.put("success", true);
            response.put("message", "Audit trail records cleared successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
